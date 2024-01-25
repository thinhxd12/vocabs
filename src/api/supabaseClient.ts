import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
// const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || ''

// const supabaseUrl = "https://ppedkpvpusslbioqalcl.supabase.co"
// const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwZWRrcHZwdXNzbGJpb3FhbGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU5OTA5MjQsImV4cCI6MjAyMTU2NjkyNH0.0PGp-dB7sw_xnKn-eKhuYMEn1vgMSnCehT1vA8UdzO8"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)