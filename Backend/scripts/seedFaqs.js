const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const FAQ = require('../models/FAQ');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI || MONGODB_URI.includes('your_mongodb_cluster_connection_string_here')) {
  console.error("Please set a valid MONGODB_URI in Backend/.env");
  process.exit(1);
}

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    // Clear existing FAQs
    await FAQ.deleteMany({});
    console.log("Cleared existing FAQs.");

    const dataPath = path.join(__dirname, '../Data/FAQ.txt');
    const rawData = fs.readFileSync(dataPath, 'utf-8');

    const lines = rawData.split('\n');

    let currentCategory = 'General';
    let currentQuestion = null;
    let currentAnswerLines = [];
    let currentSectionId = null;

    const faqsToInsert = [];

    // Regex patterns
    const categoryRegex = /^(\d+)\.\s+(.+?)\s*§\s*$/;
    const questionRegex = /^(\d+\.\d+)\s+(.+?)\s*§\s*$/;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();

        const categoryMatch = trimmedLine.match(categoryRegex);
        const questionMatch = trimmedLine.match(questionRegex);

        if (categoryMatch) {
            // Save previous question before moving to new category
            if (currentQuestion && currentQuestion.length > 0) {
                const answerText = currentAnswerLines.join('\n').trim();
                if (answerText.length > 0) {
                    faqsToInsert.push({
                        question: currentQuestion,
                        answer: answerText,
                        category: currentCategory,
                        sectionId: currentSectionId
                    });
                }
            }

            // New Category found
            currentCategory = categoryMatch[2].trim();
            currentQuestion = null;
            currentAnswerLines = [];
            currentSectionId = null;

        } else if (questionMatch) {
            // Save the previous question if it exists
            if (currentQuestion && currentQuestion.length > 0) {
                const answerText = currentAnswerLines.join('\n').trim();
                if (answerText.length > 0) {
                    faqsToInsert.push({
                        question: currentQuestion,
                        answer: answerText,
                        category: currentCategory,
                        sectionId: currentSectionId
                    });
                }
            }

            // Start tracking a new question
            const questionNum = questionMatch[1];
            currentSectionId = `q-${questionNum.replace('.', '-')}`;
            currentQuestion = questionMatch[2].trim();
            currentAnswerLines = [];

        } else if (currentQuestion && trimmedLine.length > 0) {
            // It's part of the answer body for the current question
            currentAnswerLines.push(line);
        }
    }

    // Don't forget to push the very last question!
    if (currentQuestion && currentQuestion.length > 0) {
        const answerText = currentAnswerLines.join('\n').trim();
        if (answerText.length > 0) {
            faqsToInsert.push({
                question: currentQuestion,
                answer: answerText,
                category: currentCategory,
                sectionId: currentSectionId
            });
        }
    }

    // Insert into database
    await FAQ.insertMany(faqsToInsert);
    console.log(`✅ Successfully seeded ${faqsToInsert.length} FAQs into MongoDB!`);
    
    // Display summary
    console.log('\nFAQ Summary by Category:');
    const grouped = faqsToInsert.reduce((acc, faq) => {
        if (!acc[faq.category]) acc[faq.category] = [];
        acc[faq.category].push(faq.sectionId);
        return acc;
    }, {});
    
    Object.entries(grouped).forEach(([cat, ids]) => {
        console.log(`  ${cat}: ${ids.length} FAQs`);
    });

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB.");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
