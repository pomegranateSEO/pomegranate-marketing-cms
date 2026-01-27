/**
 * Wikimedia API Wrapper
 * 
 * Uses the Wikimedia REST API to search for entities.
 * Spec: https://en.wikipedia.org/api/rest_v1/?spec
 */

export interface WikiEntity {
  id: number;
  key: string;
  title: string;
  excerpt: string;
  description: string;
  thumbnail?: {
    url: string;
    width: number;
    height: number;
  };
  url?: string;
}

export const searchWikipedia = async (query: string, limit = 5): Promise<WikiEntity[]> => {
  if (!query) return [];

  // Using the REST v1 search endpoint
  const endpoint = `https://en.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(query)}&limit=${limit}`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Wikipedia API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform response to our interface
    // The API returns { pages: [ ... ] }
    return (data.pages || []).map((page: any) => ({
      id: page.id,
      key: page.key,
      title: page.title,
      excerpt: page.excerpt,
      description: page.description,
      thumbnail: page.thumbnail ? {
        url: 'https:' + page.thumbnail.url, // Thumbnails often come without protocol
        width: page.thumbnail.width,
        height: page.thumbnail.height
      } : undefined,
      url: `https://en.wikipedia.org/wiki/${page.key}`
    }));
  } catch (error) {
    console.error("Wikipedia Search Failed:", error);
    return [];
  }
};

/**
 * Given a Wikipedia URL, fetch the corresponding Wikidata Item ID (Q-ID)
 */
export const getWikidataIdFromWikipediaUrl = async (wikipediaUrl: string): Promise<string | null> => {
  try {
    // 1. Extract the title/key from the URL
    // e.g. https://en.wikipedia.org/wiki/Elon_Musk -> Elon_Musk
    const match = wikipediaUrl.match(/\/wiki\/([^#?]+)/);
    if (!match || !match[1]) return null;
    
    const title = decodeURIComponent(match[1]);

    // 2. Query Wikipedia Action API for pageprops
    // https://en.wikipedia.org/w/api.php?action=query&prop=pageprops&ppprop=wikibase_item&redirects=1&titles=Elon_Musk&format=json&origin=*
    const endpoint = `https://en.wikipedia.org/w/api.php?action=query&prop=pageprops&ppprop=wikibase_item&redirects=1&titles=${encodeURIComponent(title)}&format=json&origin=*`;
    
    const response = await fetch(endpoint);
    const data = await response.json();

    // 3. Extract the 'wikibase_item' (Q ID)
    const pages = data.query?.pages;
    if (!pages) return null;

    const pageId = Object.keys(pages)[0];
    if (pageId === "-1") return null; // Page not found

    const qId = pages[pageId]?.pageprops?.wikibase_item;
    
    if (qId) {
      return `https://www.wikidata.org/wiki/${qId}`;
    }
    
    return null;

  } catch (error) {
    console.error("Error fetching Wikidata ID:", error);
    return null;
  }
};
