export interface FaqItem {
  question: string
  answer: string
}

export interface Post {
  id: string
  slug: string
  title: string
  description: string | null
  content: string
  featured_image: string | null
  coupang_url: string | null
  coupang_product_id: string | null
  product_name: string | null
  product_price: number | null
  category: string
  tags: string[] | null
  seo_keywords: string[] | null
  faq: FaqItem[] | null
  view_count: number
  word_count: number | null
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      posts: {
        Row: Post
        Insert: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'view_count'> & {
          id?: string
          created_at?: string
          updated_at?: string
          view_count?: number
        }
        Update: Partial<Omit<Post, 'id' | 'created_at'>>
      }
    }
  }
}
