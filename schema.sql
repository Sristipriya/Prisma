-- schema.sql
-- Run this in your Supabase SQL Editor to create the necessary tables for Prisma.

-- Create payroll_streams table
CREATE TABLE IF NOT EXISTS public.payroll_streams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_name TEXT NOT NULL,
    employee_address TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    unlocked_amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Streaming',
    proof_hash TEXT NOT NULL,
    contract_address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.payroll_streams ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own streams
CREATE POLICY "Users can view their own payroll streams" 
ON public.payroll_streams 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own streams
CREATE POLICY "Users can insert their own payroll streams" 
ON public.payroll_streams 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own streams
CREATE POLICY "Users can update their own payroll streams" 
ON public.payroll_streams 
FOR UPDATE 
USING (auth.uid() = user_id);
