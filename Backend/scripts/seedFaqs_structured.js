const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const FAQ = require('../models/FAQ');

async function seedFAQs() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Read the structured FAQ file
    const faqPath = path.resolve(__dirname, '../Data/FAQ_structured.txt');
    const content = fs.readFileSync(faqPath, 'utf-8');

    // Clear existing FAQs
    await FAQ.deleteMany({});
    console.log('🗑️  Cleared existing FAQs');

    const faqs = [];
    let currentModule = '';
    let currentModuleNum = 0;
    let currentQuestion = '';
    let currentQuestionNum = '';
    let currentAnswer = '';
    let collectingAnswer = false;
    let moduleQuestionCount = {}; // Track question count per module

    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Extract MODULE section
      const moduleMatch = line.match(/^MODULE\s+(\d+)\s*\|\s*(.+?)$/);
      if (moduleMatch) {
        currentModuleNum = parseInt(moduleMatch[1]);
        currentModule = moduleMatch[2].trim();
        moduleQuestionCount[currentModuleNum] = 0;
        continue;
      }

      // Extract question
      const questionMatch = line.match(/^---\s+([\d.]+)\s*\|\s*(.+?)\s*---\s*$/);
      if (questionMatch) {
        // Save previous FAQ if exists
        if (currentQuestion && currentAnswer && currentModule && currentModuleNum) {
          moduleQuestionCount[currentModuleNum]++;
          const displayNumber = `${currentModuleNum}.${moduleQuestionCount[currentModuleNum]}`;
          const sectionId = `q-${displayNumber.replace('.', '-')}`;
          
          faqs.push({
            question: currentQuestion,
            answer: currentAnswer.trim(),
            category: currentModule,
            moduleNumber: currentModuleNum,
            questionNumber: moduleQuestionCount[currentModuleNum],
            sectionId: sectionId,
            displayNumber: displayNumber,
            helpfulCount: 0,
            resolvedViaEscalation: false,
            gapScore: 0,
            phase: [],
            popularBadge: false
          });
        }

        // Start new question
        currentQuestion = questionMatch[2].trim();
        currentQuestionNum = questionMatch[1];
        currentAnswer = '';
        collectingAnswer = true;
        continue;
      }

      // Collect answer text
      if (collectingAnswer && line.trim() && !line.includes('================') && !line.includes('END OF MODULE')) {
        if (currentAnswer) {
          currentAnswer += '\n' + line;
        } else {
          currentAnswer = line;
        }
      }

      // End of module - save last question
      if (line.includes('END OF MODULE')) {
        if (currentQuestion && currentAnswer && currentModule && currentModuleNum) {
          moduleQuestionCount[currentModuleNum]++;
          const displayNumber = `${currentModuleNum}.${moduleQuestionCount[currentModuleNum]}`;
          const sectionId = `q-${displayNumber.replace('.', '-')}`;
          
          faqs.push({
            question: currentQuestion,
            answer: currentAnswer.trim(),
            category: currentModule,
            moduleNumber: currentModuleNum,
            questionNumber: moduleQuestionCount[currentModuleNum],
            sectionId: sectionId,
            displayNumber: displayNumber,
            helpfulCount: 0,
            resolvedViaEscalation: false,
            gapScore: 0,
            phase: [],
            popularBadge: false
          });
        }
        currentQuestion = '';
        currentAnswer = '';
        collectingAnswer = false;
      }
    }

    // Insert all FAQs
    if (faqs.length > 0) {
      await FAQ.insertMany(faqs);
      console.log(`\n✅ Successfully seeded ${faqs.length} FAQs into MongoDB!\n`);

      // Display summary by category
      const byCategory = {};
      faqs.forEach(faq => {
        if (!byCategory[faq.category]) {
          byCategory[faq.category] = [];
        }
        byCategory[faq.category].push(faq.displayNumber);
      });

      console.log('📊 FAQ Summary by Module:');
      Object.entries(byCategory)
        .sort((a, b) => {
          const numA = parseInt(a[1][0].split('.')[0]);
          const numB = parseInt(b[1][0].split('.')[0]);
          return numA - numB;
        })
        .forEach(([category, numbers]) => {
          console.log(`   Module ${numbers[0].split('.')[0]} - ${category}: ${numbers.length} questions`);
          console.log(`      Questions: ${numbers.join(', ')}`);
        });
    } else {
      console.log('⚠️  No FAQs found to seed');
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error seeding FAQs:', error);
    process.exit(1);
  }
}

seedFAQs();
