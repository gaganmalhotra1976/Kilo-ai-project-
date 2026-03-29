-- Migration: Rename tables for architecture alignment
-- Rename customers -> patients, documentStorage -> temp_docs, vaccineInventory -> vaccine_vectors

-- Rename customers to patients
ALTER TABLE customers RENAME TO patients;

-- Rename documentStorage to temp_docs
ALTER TABLE document_storage RENAME TO temp_docs;

-- Rename vaccine_inventory to vaccine_vectors
ALTER TABLE vaccine_inventory RENAME TO vaccine_vectors;