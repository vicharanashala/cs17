import { useState, useEffect } from 'react';
import TopNavBar from '../components/TopNavBar';
import SearchBar from '../components/SearchBar';
import AccordionCard from '../components/AccordionCard';
import ChatbotWidget from '../components/ChatbotWidget';
import api from '../lib/axios';

export default function Page1_FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [targetFaqId, setTargetFaqId] = useState('');

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await api.get('/faqs');
        setFaqs(response.data);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const searchTerms = searchQuery
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  const isSearching = searchTerms.length > 0;
  const searchResults = isSearching
    ? faqs.filter((faq) => {
        const searchableText = [
          faq.displayNumber,
          faq.question,
          faq.answer,
          faq.category,
        ].join(' ').toLowerCase();

        return searchTerms.every((term) => searchableText.includes(term));
      })
    : [];

  const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const highlightMatches = (text) => {
    if (!text || !isSearching) return text;

    const pattern = searchTerms.map(escapeRegExp).join('|');
    const regex = new RegExp(`(${pattern})`, 'gi');

    return text.split(regex).map((part, index) => {
      const isMatch = searchTerms.some((term) => part.toLowerCase() === term);
      return isMatch ? (
        <mark key={`${part}-${index}`} className="bg-yellow-200 text-ink-900 rounded px-1">
          {part}
        </mark>
      ) : (
        part
      );
    });
  };

  const getMatchSnippet = (faq) => {
    const fields = [faq.question, faq.answer, faq.category].filter(Boolean);
    const matchingField = fields.find((field) =>
      searchTerms.some((term) => field.toLowerCase().includes(term))
    );

    if (!matchingField) return faq.question;

    const lowerField = matchingField.toLowerCase();
    const firstMatchIndex = searchTerms
      .map((term) => lowerField.indexOf(term))
      .filter((index) => index >= 0)
      .sort((a, b) => a - b)[0];
    const start = Math.max(firstMatchIndex - 70, 0);
    const end = Math.min(firstMatchIndex + 150, matchingField.length);
    const prefix = start > 0 ? '...' : '';
    const suffix = end < matchingField.length ? '...' : '';

    return `${prefix}${matchingField.slice(start, end)}${suffix}`;
  };

  const jumpToFaq = (faqId) => {
    setTargetFaqId(faqId);

    requestAnimationFrame(() => {
      document.getElementById(faqId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
  };

  // Group FAQs by category and sort by moduleNumber
  const groupedFaqs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {});

  // Sort categories by moduleNumber and sort questions within each category numerically
  const sortedGroupedFaqs = Object.entries(groupedFaqs)
    .sort(([, a], [, b]) => {
      const moduleA = a[0]?.moduleNumber || 0;
      const moduleB = b[0]?.moduleNumber || 0;
      return moduleA - moduleB;
    })
    .reduce((acc, [category, faqsInCategory]) => {
      // Sort questions by displayNumber (e.g., "13.1", "13.2", "13.10")
      acc[category] = faqsInCategory.sort((a, b) => {
        const [moduleA, qNumA] = (a.displayNumber || '0.0').split('.').map(Number);
        const [moduleB, qNumB] = (b.displayNumber || '0.0').split('.').map(Number);
        
        // First compare module numbers (shouldn't differ within a category, but just in case)
        if (moduleA !== moduleB) return moduleA - moduleB;
        
        // Then compare question numbers numerically
        return qNumA - qNumB;
      });
      return acc;
    }, {});

  return (
    <div className="font-body-md text-body-md min-h-screen flex flex-col">
      <TopNavBar active="faq" />
      <main className="flex-1 w-full max-w-content-max-width mx-auto px-4 md:px-8 py-12 pb-32">
          {/* Hero / Search Section */}
          <section className="mb-12 text-center">
            <h1 className="font-display-lg text-display-lg text-ink-900 mb-4">Find your answer.</h1>
            <p className="font-body-lg text-body-lg text-ink-700 mb-8 max-w-xl mx-auto">
              Search the public knowledge base for immediate answers to common technical inquiries.
            </p>
            
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            {isSearching && (
              <div className="mt-4 max-w-2xl mx-auto text-left">
                <p className="mb-2 font-body-sm text-body-sm text-ink-500">
                  {searchResults.length} match{searchResults.length === 1 ? '' : 'es'} found for "{searchQuery.trim()}"
                </p>
                {searchResults.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto rounded-lg border border-ink-100 bg-surface shadow-sm divide-y divide-ink-100">
                    {searchResults.map((faq) => (
                      <button
                        key={faq._id}
                        type="button"
                        onClick={() => jumpToFaq(faq._id)}
                        className="block w-full text-left px-4 py-3 hover:bg-ink-50 transition-colors"
                      >
                        <span className="block font-label-mono text-label-mono text-primary mb-1">
                          {faq.displayNumber} · {faq.category}
                        </span>
                        <span className="block font-body-md text-body-md font-medium text-ink-900">
                          {highlightMatches(faq.question)}
                        </span>
                        <span className="block mt-1 font-body-sm text-body-sm text-ink-600 line-clamp-2">
                          {highlightMatches(getMatchSnippet(faq))}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-ink-100 bg-surface px-4 py-3 font-body-sm text-body-sm text-ink-500">
                    No FAQ matches found.
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Content Area (Accordion Cards) */}
          <div className="mb-6">
            <h2 className="font-headline-md text-headline-md font-black uppercase tracking-wide text-ink-800">Contents</h2>
          </div>

          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-10 text-ink-500">Loading FAQs...</div>
            ) : Object.keys(sortedGroupedFaqs).length === 0 ? (
              <div className="text-center py-10 text-ink-500">No FAQs found.</div>
            ) : (
              Object.entries(sortedGroupedFaqs).map(([category, categoryFaqs]) => (
                <div key={category} className="mb-10">
                  <h3 className="font-body-lg text-body-lg font-bold text-ink-900 mb-4 flex items-center gap-2" id={categoryFaqs[0].category}>
                    <span className="w-1 h-6 bg-primary rounded-r-sm"></span>
                    {categoryFaqs[0]?.moduleNumber}. {category}
                  </h3>
                  <div className="space-y-3 pl-3">
                    {categoryFaqs.map((faq) => (
                      <AccordionCard 
                        key={faq._id}
                        id={faq._id}
                        title={`${faq.displayNumber} ${faq.question}`}
                        content={faq.answer}
                        shouldOpen={targetFaqId === faq._id}
                        helpfulCount={faq.helpfulCount > 0 ? faq.helpfulCount : null}
                        isVerified={faq.resolvedViaEscalation}
                        note={faq.peerFootnote?.approvedByAdmin ? faq.peerFootnote.text : null}
                        sectionId={faq.sectionId}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
      </main>
      <ChatbotWidget />
    </div>
  );
}
