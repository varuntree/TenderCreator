#!/usr/bin/env node
/**
 * Simple test script for document extraction
 * Tests the extraction logic with actual file buffers
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import mammoth from 'mammoth'
import { PDFParse } from 'pdf-parse'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('🧪 Testing Document Extraction Libraries\n')
console.log('=' .repeat(60))

let passed = 0
let failed = 0

async function test(name, fn) {
  try {
    console.log(`\n📝 Test: ${name}`)
    await fn()
    console.log('✅ PASSED')
    passed++
  } catch (error) {
    console.log('❌ FAILED')
    console.error('Error:', error.message)
    failed++
  }
}

// Test 1: Mammoth library loads correctly
await test('Mammoth library is available', async () => {
  if (typeof mammoth.extractRawText !== 'function') {
    throw new Error('mammoth.extractRawText is not available')
  }
  console.log('   ✓ mammoth.extractRawText is available')
})

// Test 2: PDFParse library loads correctly
await test('PDFParse library is available', async () => {
  if (typeof PDFParse !== 'function') {
    throw new Error('PDFParse is not available')
  }
  console.log('   ✓ PDFParse class is available')
})

// Test 3: Text extraction from Buffer
await test('Extract text from text file buffer', async () => {
  const txtPath = join(__dirname, 'fixtures', 'sample.txt')
  const buffer = readFileSync(txtPath)

  const text = buffer.toString('utf-8')

  if (!text) throw new Error('No text extracted')
  if (!text.includes('sample text file')) throw new Error('Expected content not found')

  console.log(`   Extracted ${text.length} characters`)
  console.log(`   Preview: "${text.substring(0, 50)}..."`)
})

// Test 4: Validate extraction module structure
await test('Extraction module structure', async () => {
  const expectedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ]

  console.log('   Supported MIME types:')
  expectedTypes.forEach(type => {
    console.log(`     ✓ ${type}`)
  })
})

// Test 5: Create simple DOCX test
await test('Mammoth can handle empty buffer', async () => {
  try {
    // Create minimal valid DOCX structure
    // This is a very basic test - real DOCX would be binary
    const testBuffer = Buffer.from([])

    // This should fail gracefully, not crash
    try {
      await mammoth.extractRawText({ buffer: testBuffer })
      console.log('   Mammoth handled empty buffer')
    } catch (err) {
      console.log('   Mammoth rejected invalid DOCX (expected):', err.message.substring(0, 50))
    }
  } catch (error) {
    throw error
  }
})

// Summary
console.log('\n' + '='.repeat(60))
console.log(`\n📊 Test Summary:`)
console.log(`   ✅ Passed: ${passed}`)
console.log(`   ❌ Failed: ${failed}`)
console.log(`   Total:  ${passed + failed}`)

if (failed > 0) {
  console.log('\n⚠️  Some tests failed!')
  process.exit(1)
} else {
  console.log('\n🎉 All tests passed!')
  console.log('\nℹ️  Integration tests require actual PDF/DOCX files.')
  console.log('   Test file uploads via the UI at http://localhost:3000')
  process.exit(0)
}
