import { NextRequest, NextResponse } from 'next/server'

interface PubMedResult {
  uid: string
  title: string
  authors: { name: string }[]
  fulljournalname: string
  pubdate: string
  elocationid: string
  sortpubdate: string
  articleids: { idtype: string; value: string }[]
}

async function searchPubMed(query: string, limit: number) {
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${limit}&retmode=json`
  const searchRes = await fetch(searchUrl)
  const searchData = await searchRes.json()
  const ids: string[] = searchData?.esearchresult?.idlist || []

  if (ids.length === 0) return []

  const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`
  const summaryRes = await fetch(summaryUrl)
  const summaryData = await summaryRes.json()
  const results = summaryData?.result || {}

  return ids.map(id => {
    const item: PubMedResult = results[id]
    if (!item) return null
    const doi = item.articleids?.find(a => a.idtype === 'doi')?.value || null
    const year = parseInt(item.sortpubdate?.split('/')[0] || item.pubdate?.split(' ')[0]) || 0
    return {
      id: `pubmed-${id}`,
      source: 'PubMed',
      title: item.title || '',
      authors: (item.authors || []).map(a => a.name),
      journal: item.fulljournalname || '',
      year,
      doi,
      pmid: id,
      abstract: null,
      is_open_access: false,
      url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
    }
  }).filter(Boolean)
}

async function searchOpenAlex(query: string, limit: number) {
  const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per_page=${limit}&select=id,title,authorships,primary_location,publication_year,doi,open_access`
  const res = await fetch(url, { headers: { 'User-Agent': 'ModulaHealth/1.0 (mailto:dev@modulahealth.com)' } })
  const data = await res.json()
  const works = data?.results || []

  return works.map((w: any) => ({
    id: `openalex-${w.id?.split('/').pop()}`,
    source: 'OpenAlex',
    title: w.title || '',
    authors: (w.authorships || []).slice(0, 5).map((a: any) => a.author?.display_name || ''),
    journal: w.primary_location?.source?.display_name || '',
    year: w.publication_year || 0,
    doi: w.doi?.replace('https://doi.org/', '') || null,
    pmid: null,
    abstract: null,
    is_open_access: w.open_access?.is_oa || false,
    url: w.doi || w.id || '',
  }))
}

async function searchCrossref(query: string, limit: number) {
  const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${limit}&select=DOI,title,author,container-title,published-print,published-online`
  const res = await fetch(url, { headers: { 'User-Agent': 'ModulaHealth/1.0 (mailto:dev@modulahealth.com)' } })
  const data = await res.json()
  const items = data?.message?.items || []

  return items.map((item: any) => {
    const pubDate = item['published-print']?.['date-parts']?.[0] || item['published-online']?.['date-parts']?.[0]
    return {
      id: `crossref-${item.DOI}`,
      source: 'Crossref',
      title: item.title?.[0] || '',
      authors: (item.author || []).slice(0, 5).map((a: any) => `${a.given || ''} ${a.family || ''}`.trim()),
      journal: item['container-title']?.[0] || '',
      year: pubDate?.[0] || 0,
      doi: item.DOI || null,
      pmid: null,
      abstract: null,
      is_open_access: false,
      url: `https://doi.org/${item.DOI}`,
    }
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const source = searchParams.get('source') || 'pubmed'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

    if (!query) {
      return NextResponse.json({ error: 'Parâmetro "q" é obrigatório' }, { status: 400 })
    }

    let articles: any[]

    switch (source) {
      case 'openalex':
        articles = await searchOpenAlex(query, limit)
        break
      case 'crossref':
        articles = await searchCrossref(query, limit)
        break
      case 'pubmed':
      default:
        articles = await searchPubMed(query, limit)
        break
    }

    return NextResponse.json({ articles, source, query, count: articles.length })
  } catch (err) {
    console.error('Erro na busca de artigos:', err)
    return NextResponse.json(
      { error: 'Erro ao buscar artigos. Tente novamente.' },
      { status: 500 }
    )
  }
}
