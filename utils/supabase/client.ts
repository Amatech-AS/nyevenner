import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    'https://mtsvbtbbdiueqppjjfev.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10c3ZidGJiZGl1ZXFwcGpqZmV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MjM4NjYsImV4cCI6MjA3OTQ5OTg2Nn0.zeoGEIcKDRUjb-P8LxZ0QK-c94jfNbFLw6u4VQi18nE'
  )
}