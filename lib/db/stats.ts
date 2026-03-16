
import { supabase } from '../supabaseAdmin';

export async function getDashboardStats() {
  const { count: businesses } = await supabase.from('businesses').select('*', { count: 'exact', head: true });
  const { count: services } = await supabase.from('services').select('*', { count: 'exact', head: true });
  const { count: locations } = await supabase.from('target_locations').select('*', { count: 'exact', head: true });
  
  // Knowledge Entities
  let knowledge = 0;
  try {
     // Updated table name from knowledge_entities to knowledge_graph_entities
     const { count } = await supabase.from('knowledge_graph_entities').select('*', { count: 'exact', head: true });
     knowledge = count || 0;
  } catch (e) {
      // Ignore if table doesn't exist yet (e.g. during migration)
  }

  // Blog Topics
  let topics = 0;
  try {
      const { count } = await supabase.from('blog_topics').select('*', { count: 'exact', head: true });
      topics = count || 0;
  } catch (e) {
      // Ignore
  }

  // Generated Pages
  let pages = 0;
  try {
      const { count } = await supabase.from('pseo_page_instances').select('*', { count: 'exact', head: true });
      pages = count || 0;
  } catch (e) {
      // Ignore
  }

  return { 
    businesses: businesses || 0, 
    services: services || 0, 
    locations: locations || 0,
    knowledge,
    pages,
    topics
  };
}
