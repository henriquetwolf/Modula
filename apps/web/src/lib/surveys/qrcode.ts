/**
 * Gerador de QR Code minimo (modo byte, nivel de correcao M, versoes 1-20).
 * Implementado localmente para nao depender de pacote externo nem de servico de rede.
 * Referencia: ISO/IEC 18004.
 */

// Codewords de correcao de erro por bloco, nivel M, indexado por versao 1..20
const ECC_PER_BLOCK = [
  10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26,
]

// Quantidade de blocos de correcao de erro, nivel M, indexado por versao 1..20
const ECC_BLOCKS = [
  1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16,
]

const MAX_VERSION = 20
const FORMAT_ECC_BITS_M = 0b00

function numRawDataModules(version: number): number {
  let result = (16 * version + 128) * version + 64
  if (version >= 2) {
    const numAlign = Math.floor(version / 7) + 2
    result -= (25 * numAlign - 10) * numAlign - 55
    if (version >= 7) result -= 36
  }
  return result
}

function numDataCodewords(version: number): number {
  return (
    Math.floor(numRawDataModules(version) / 8) -
    ECC_PER_BLOCK[version - 1] * ECC_BLOCKS[version - 1]
  )
}

function alignmentPatternPositions(version: number): number[] {
  if (version === 1) return []
  const numAlign = Math.floor(version / 7) + 2
  const step = Math.ceil((version * 4 + 4) / (numAlign * 2 - 2)) * 2
  const result = [6]
  for (let pos = version * 4 + 10; result.length < numAlign; pos -= step) {
    result.splice(1, 0, pos)
  }
  return result
}

// Multiplicacao em GF(256) com polinomio primitivo 0x11D
function gfMul(x: number, y: number): number {
  let z = 0
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d)
    z ^= ((y >>> i) & 1) * x
  }
  return z & 0xff
}

function rsGeneratorPoly(degree: number): number[] {
  const result = new Array<number>(degree).fill(0)
  result[degree - 1] = 1
  let root = 1
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      result[j] = gfMul(result[j], root)
      if (j + 1 < degree) result[j] ^= result[j + 1]
    }
    root = gfMul(root, 0x02)
  }
  return result
}

function rsRemainder(data: number[], generator: number[]): number[] {
  const result = new Array<number>(generator.length).fill(0)
  for (const b of data) {
    const factor = b ^ (result.shift() as number)
    result.push(0)
    for (let i = 0; i < generator.length; i++) {
      result[i] ^= gfMul(generator[i], factor)
    }
  }
  return result
}

function getBit(value: number, index: number): boolean {
  return ((value >>> index) & 1) !== 0
}

function chooseVersion(byteLength: number): number {
  for (let version = 1; version <= MAX_VERSION; version++) {
    const charCountBits = version < 10 ? 8 : 16
    const capacityBits = numDataCodewords(version) * 8
    if (4 + charCountBits + byteLength * 8 <= capacityBits) return version
  }
  throw new Error('Texto muito longo para gerar o QR code.')
}

function buildDataCodewords(bytes: number[], version: number): number[] {
  const bits: boolean[] = []
  const appendBits = (value: number, length: number) => {
    for (let i = length - 1; i >= 0; i--) bits.push(getBit(value, i))
  }

  appendBits(0b0100, 4) // modo byte
  appendBits(bytes.length, version < 10 ? 8 : 16)
  for (const b of bytes) appendBits(b, 8)

  const capacityBits = numDataCodewords(version) * 8
  appendBits(0, Math.min(4, capacityBits - bits.length)) // terminador
  appendBits(0, (8 - (bits.length % 8)) % 8) // alinha em byte

  const codewords: number[] = []
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0
    for (let j = 0; j < 8; j++) byte = (byte << 1) | (bits[i + j] ? 1 : 0)
    codewords.push(byte)
  }

  // Bytes de preenchimento alternados
  for (let pad = 0xec; codewords.length < numDataCodewords(version); pad ^= 0xec ^ 0x11) {
    codewords.push(pad)
  }

  return codewords
}

function addEccAndInterleave(data: number[], version: number): number[] {
  const numBlocks = ECC_BLOCKS[version - 1]
  const blockEccLen = ECC_PER_BLOCK[version - 1]
  const rawCodewords = Math.floor(numRawDataModules(version) / 8)
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks)
  const shortBlockLen = Math.floor(rawCodewords / numBlocks)

  const blocks: number[][] = []
  const generator = rsGeneratorPoly(blockEccLen)
  for (let i = 0, k = 0; i < numBlocks; i++) {
    const dataLen = shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1)
    const block = data.slice(k, k + dataLen)
    k += dataLen
    const ecc = rsRemainder(block, generator)
    if (i < numShortBlocks) block.push(0) // preenchimento para alinhar o interleave
    blocks.push(block.concat(ecc))
  }

  const result: number[] = []
  for (let i = 0; i < blocks[0].length; i++) {
    for (let j = 0; j < blocks.length; j++) {
      // O byte de preenchimento dos blocos curtos e ignorado
      if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) {
        result.push(blocks[j][i])
      }
    }
  }
  return result
}

class QrMatrix {
  readonly size: number
  readonly modules: boolean[][]
  private readonly version: number
  private readonly isFunction: boolean[][]

  constructor(version: number) {
    this.version = version
    this.size = version * 4 + 17
    this.modules = Array.from({ length: this.size }, () =>
      new Array<boolean>(this.size).fill(false)
    )
    this.isFunction = Array.from({ length: this.size }, () =>
      new Array<boolean>(this.size).fill(false)
    )
  }

  private setFunctionModule(x: number, y: number, isDark: boolean) {
    if (x < 0 || x >= this.size || y < 0 || y >= this.size) return
    this.modules[y][x] = isDark
    this.isFunction[y][x] = true
  }

  private drawFinderPattern(x: number, y: number) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy))
        this.setFunctionModule(x + dx, y + dy, dist !== 2 && dist !== 4)
      }
    }
  }

  private drawAlignmentPattern(x: number, y: number) {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        this.setFunctionModule(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1)
      }
    }
  }

  drawFunctionPatterns() {
    for (let i = 0; i < this.size; i++) {
      this.setFunctionModule(6, i, i % 2 === 0)
      this.setFunctionModule(i, 6, i % 2 === 0)
    }

    this.drawFinderPattern(3, 3)
    this.drawFinderPattern(this.size - 4, 3)
    this.drawFinderPattern(3, this.size - 4)

    const positions = alignmentPatternPositions(this.version)
    const last = positions.length - 1
    for (let i = 0; i <= last; i++) {
      for (let j = 0; j <= last; j++) {
        const isFinderCorner =
          (i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)
        if (!isFinderCorner) {
          this.drawAlignmentPattern(positions[i], positions[j])
        }
      }
    }

    this.drawFormatBits(0)
    this.drawVersionBits()
  }

  drawFormatBits(mask: number) {
    const data = (FORMAT_ECC_BITS_M << 3) | mask
    let rem = data
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537)
    const bits = ((data << 10) | rem) ^ 0x5412

    for (let i = 0; i <= 5; i++) this.setFunctionModule(8, i, getBit(bits, i))
    this.setFunctionModule(8, 7, getBit(bits, 6))
    this.setFunctionModule(8, 8, getBit(bits, 7))
    this.setFunctionModule(7, 8, getBit(bits, 8))
    for (let i = 9; i < 15; i++) this.setFunctionModule(14 - i, 8, getBit(bits, i))

    for (let i = 0; i < 8; i++) {
      this.setFunctionModule(this.size - 1 - i, 8, getBit(bits, i))
    }
    for (let i = 8; i < 15; i++) {
      this.setFunctionModule(8, this.size - 15 + i, getBit(bits, i))
    }
    this.setFunctionModule(8, this.size - 8, true) // modulo escuro fixo
  }

  private drawVersionBits() {
    if (this.version < 7) return
    let rem = this.version
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25)
    const bits = (this.version << 12) | rem

    for (let i = 0; i < 18; i++) {
      const bit = getBit(bits, i)
      const a = this.size - 11 + (i % 3)
      const b = Math.floor(i / 3)
      this.setFunctionModule(a, b, bit)
      this.setFunctionModule(b, a, bit)
    }
  }

  drawCodewords(codewords: number[]) {
    let i = 0
    for (let right = this.size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5
      for (let vert = 0; vert < this.size; vert++) {
        for (let j = 0; j < 2; j++) {
          const x = right - j
          const upward = ((right + 1) & 2) === 0
          const y = upward ? this.size - 1 - vert : vert
          if (!this.isFunction[y][x] && i < codewords.length * 8) {
            this.modules[y][x] = getBit(codewords[i >>> 3], 7 - (i & 7))
            i++
          }
        }
      }
    }
  }

  applyMask(mask: number) {
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (this.isFunction[y][x]) continue
        let invert: boolean
        switch (mask) {
          case 0:
            invert = (x + y) % 2 === 0
            break
          case 1:
            invert = y % 2 === 0
            break
          case 2:
            invert = x % 3 === 0
            break
          case 3:
            invert = (x + y) % 3 === 0
            break
          case 4:
            invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0
            break
          case 5:
            invert = ((x * y) % 2) + ((x * y) % 3) === 0
            break
          case 6:
            invert = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0
            break
          default:
            invert = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0
            break
        }
        if (invert) this.modules[y][x] = !this.modules[y][x]
      }
    }
  }

  penaltyScore(): number {
    const N1 = 3
    const N2 = 3
    const N3 = 40
    const N4 = 10
    let result = 0

    // Regra 1: sequencias de 5+ modulos iguais em linhas e colunas
    for (let y = 0; y < this.size; y++) {
      let runColor = false
      let runLen = 0
      for (let x = 0; x < this.size; x++) {
        if (this.modules[y][x] === runColor) {
          runLen++
          if (runLen === 5) result += N1
          else if (runLen > 5) result++
        } else {
          runColor = this.modules[y][x]
          runLen = 1
        }
      }
    }
    for (let x = 0; x < this.size; x++) {
      let runColor = false
      let runLen = 0
      for (let y = 0; y < this.size; y++) {
        if (this.modules[y][x] === runColor) {
          runLen++
          if (runLen === 5) result += N1
          else if (runLen > 5) result++
        } else {
          runColor = this.modules[y][x]
          runLen = 1
        }
      }
    }

    // Regra 2: blocos 2x2 de cor uniforme
    for (let y = 0; y < this.size - 1; y++) {
      for (let x = 0; x < this.size - 1; x++) {
        const color = this.modules[y][x]
        if (
          color === this.modules[y][x + 1] &&
          color === this.modules[y + 1][x] &&
          color === this.modules[y + 1][x + 1]
        ) {
          result += N2
        }
      }
    }

    // Regra 3: padroes semelhantes ao finder (1:1:3:1:1 com area clara)
    const finder = [true, false, true, true, true, false, true]
    const matchesAt = (get: (i: number) => boolean, start: number): boolean => {
      for (let i = 0; i < 7; i++) {
        if (get(start + i) !== finder[i]) return false
      }
      return true
    }
    const hasLightArea = (get: (i: number) => boolean, from: number, to: number): boolean => {
      for (let i = from; i < to; i++) {
        if (i >= 0 && i < this.size && get(i)) return false
      }
      return true
    }
    for (let y = 0; y < this.size; y++) {
      const get = (i: number) => (i >= 0 && i < this.size ? this.modules[y][i] : false)
      for (let x = 0; x <= this.size - 7; x++) {
        if (!matchesAt(get, x)) continue
        if (hasLightArea(get, x - 4, x) || hasLightArea(get, x + 7, x + 11)) result += N3
      }
    }
    for (let x = 0; x < this.size; x++) {
      const get = (i: number) => (i >= 0 && i < this.size ? this.modules[i][x] : false)
      for (let y = 0; y <= this.size - 7; y++) {
        if (!matchesAt(get, y)) continue
        if (hasLightArea(get, y - 4, y) || hasLightArea(get, y + 7, y + 11)) result += N3
      }
    }

    // Regra 4: desvio da proporcao de 50% de modulos escuros
    let dark = 0
    for (const row of this.modules) {
      for (const cell of row) if (cell) dark++
    }
    const total = this.size * this.size
    const k = Math.floor((Math.abs(dark * 20 - total * 10) * 10) / total)
    result += k * N4

    return result
  }
}

/**
 * Gera a matriz do QR code para o texto informado.
 * `true` representa modulo escuro. Nao inclui a margem (quiet zone).
 */
export function generateQrMatrix(text: string): boolean[][] {
  const bytes = Array.from(new TextEncoder().encode(text))
  const version = chooseVersion(bytes.length)
  const dataCodewords = buildDataCodewords(bytes, version)
  const allCodewords = addEccAndInterleave(dataCodewords, version)

  let best: boolean[][] | null = null
  let bestScore = Infinity

  for (let mask = 0; mask < 8; mask++) {
    const qr = new QrMatrix(version)
    qr.drawFunctionPatterns()
    qr.drawCodewords(allCodewords)
    qr.drawFormatBits(mask)
    qr.applyMask(mask)
    const score = qr.penaltyScore()
    if (score < bestScore) {
      bestScore = score
      best = qr.modules.map((row) => [...row])
    }
  }

  return best as boolean[][]
}

/** Constroi um SVG do QR code, pronto para download ou exibicao. */
export function qrMatrixToSvg(matrix: boolean[][], quietZone = 4): string {
  const size = matrix.length
  const total = size + quietZone * 2
  const paths: string[] = []

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (matrix[y][x]) {
        paths.push(`M${x + quietZone},${y + quietZone}h1v1h-1z`)
      }
    }
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${total * 8}" height="${total * 8}" shape-rendering="crispEdges">`,
    `<rect width="${total}" height="${total}" fill="#ffffff"/>`,
    `<path d="${paths.join('')}" fill="#000000"/>`,
    `</svg>`,
  ].join('')
}

/**
 * Desenha o QR code em um canvas e devolve um data URL PNG.
 * Precisa rodar no browser.
 */
export function qrMatrixToPngDataUrl(
  matrix: boolean[][],
  targetSize = 1024,
  quietZone = 4
): string {
  const size = matrix.length
  const total = size + quietZone * 2
  const scale = Math.max(1, Math.floor(targetSize / total))
  const canvasSize = total * scale

  const canvas = document.createElement('canvas')
  canvas.width = canvasSize
  canvas.height = canvasSize
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Nao foi possivel criar o contexto do canvas.')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasSize, canvasSize)
  ctx.fillStyle = '#000000'
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (matrix[y][x]) {
        ctx.fillRect((x + quietZone) * scale, (y + quietZone) * scale, scale, scale)
      }
    }
  }

  return canvas.toDataURL('image/png')
}
