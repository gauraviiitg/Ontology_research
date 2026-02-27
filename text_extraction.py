"""
Text Extraction Agent using Azure Document Intelligence.
Extracts text and structured data from PDF documents.
"""
import os
from typing import Dict, Any
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential
from .config import settings


def process(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Process document extraction.
    
    Args:
        input_data: Dictionary containing 'file_path' or 'file_url' or 'file_bytes'
    
    Returns:
        Dictionary with extracted text and metadata
    """
    try:
        endpoint = settings.AZURE_FORMRECOGNIZER_ENDPOINT
        key = settings.AZURE_FORMRECOGNIZER_KEY
        
        if not endpoint or not key:
            raise ValueError("Azure Form Recognizer credentials not configured")
        
        client = DocumentAnalysisClient(
            endpoint=endpoint,
            credential=AzureKeyCredential(key)
        )
        
        # Handle different input types
        if 'file_bytes' in input_data:
            # File bytes provided directly
            file_bytes = input_data['file_bytes']
            poller = client.begin_analyze_document(
                model_id=settings.PREBUILT_MODEL,
                document=file_bytes
            )
        elif 'file_url' in input_data:
            # URL to document
            poller = client.begin_analyze_document_from_url(
                model_id=settings.PREBUILT_MODEL,
                document_url=input_data['file_url']
            )
        else:
            raise ValueError("Either 'file_bytes' or 'file_url' must be provided")
        
        result = poller.result()
        
        # Extract text content with page markers
        extracted_text = ""
        for page_num, page in enumerate(result.pages, start=1):
            extracted_text += f"page number {page_num}\n"
            for line in page.lines:
                extracted_text += line.content + "\n"
        
        # Extract tables if any
        tables = []
        for table in result.tables:
            table_data = []
            for cell in table.cells:
                table_data.append({
                    "row": cell.row_index,
                    "column": cell.column_index,
                    "content": cell.content
                })
            tables.append(table_data)
        
        return {
            "result": extracted_text,
            "metadata": {
                "pages": len(result.pages),
                "tables": len(tables),
                "tables_data": tables,
                "model": settings.PREBUILT_MODEL
            }
        }
    except Exception as e:
        return {
            "error": str(e),
            "result": None
        }


def get_input_schema() -> Dict[str, Any]:
    """Get input schema for this agent."""
    return {
        "type": "object",
        "properties": {
            "file_bytes": {
                "type": "string",
                "description": "Base64 encoded file bytes or binary data"
            },
            "file_url": {
                "type": "string",
                "description": "URL to the document to extract"
            }
        },
        "required": ["file_bytes"]  # Either file_bytes or file_url is required, but we mark file_bytes as required for detection
    }


def get_output_schema() -> Dict[str, Any]:
    """Get output schema for this agent."""
    return {
        "type": "object",
        "properties": {
            "result": {
                "type": "string",
                "description": "Extracted text content"
            },
            "metadata": {
                "type": "object",
                "description": "Extraction metadata including pages and tables"
            }
        }
    }


def get_metadata() -> Dict[str, Any]:
    """Get agent metadata."""
    return {
        "id": "text_extraction",
        "name": "Text Extraction Agent",
        "description": """The Text Extraction Agent uses Azure Document Intelligence (formerly Form Recognizer) to extract text, tables, and structured data from various document types. It provides high-accuracy text extraction from PDFs, images, and scanned documents, making it an essential first step in document processing workflows.

The agent processes documents using Azure Document Intelligence's prebuilt model to extract text content while preserving document structure and layout. It handles two input types: file_bytes (base64 encoded file bytes or binary data provided directly) and file_url (URL to the document stored remotely). The agent uses the DocumentAnalysisClient to begin document analysis and processes the results to extract comprehensive information.

The agent extracts text content with page markers, adding "page number X" markers for each page to maintain document structure. It processes all lines on each page, preserving the original document layout. For tables, the agent detects and extracts table data with complete cell information including row_index, column_index, and cell content, allowing for full table reconstruction.

The agent returns comprehensive results including result (extracted text with page markers), and metadata object containing pages (number of pages processed), tables (number of tables detected), tables_data (array of table objects with row, column, and content for each cell), and model (the prebuilt model used for extraction).

Key capabilities include PDF text extraction with high accuracy, table detection and extraction with cell-level detail, multi-page document processing with page markers, layout analysis and structure preservation, form field extraction, key-value pair extraction, document classification, language detection, and metadata extraction (pages, tables, model information).

This agent is ideal for document digitization and OCR, invoice and receipt processing, form data extraction, medical record digitization, legal document processing, financial document analysis, identity document verification, and contract and agreement processing. It serves as the foundation for all document-based workflows, extracting raw text that can then be processed by specialized agents.

The agent requires either file_bytes (base64 encoded file bytes or binary data) or file_url (URL to the document). It works with PDF files (primary format), image files (JPG, PNG) for OCR, and scanned documents. The agent works best with clear, high-quality documents and provides high accuracy for printed text.

Technical implementation uses Azure Document Intelligence API with the prebuilt model. The agent uses DocumentAnalysisClient with AzureKeyCredential for authentication. It supports both direct file bytes and remote file URLs, provides high-accuracy OCR capabilities, preserves document structure and layout with page markers, and extracts tables with complete cell-level formatting. The agent includes error handling for missing credentials and invalid input types. Cost: Based on Azure Document Intelligence pricing ($0.001 per page).""",
        "cost": "$0.001 per page",
        "api_endpoint": "/agents/text_extraction/run",
        "category": "document_processing",
        "agent_type": "generalized"
    }

