import { Link } from 'react-router-dom';
import TopNavBar from '../components/TopNavBar';
import ChatbotWidget from '../components/ChatbotWidget';

const badgeJourney = [
  ['Bronze', '1', 'Training: a course or direct assignment, decided by the mentor based on what you already know.', 'Usually entry'],
  ['Silver', '2', 'Open-source project work with a Vicharanashala mentor.', 'Yes'],
  ['Gold', '3', 'A genuinely significant Silver contribution, substantial enough to stand as a feature.', 'No'],
  ['Platinum', '4', 'An invitation to visit the lab in the following twelve months; the fourth star is earned during that visit.', 'No'],
];

export default function Page0_Overview() {
  return (
    <div className="font-body-md text-body-md min-h-screen flex flex-col">
      <TopNavBar active="overview" />
      <main className="flex-1 w-full max-w-4xl mx-auto px-5 md:px-8 py-12 pb-28">
        <header className="mb-10 border-b border-ink-100 pb-6">
          <h1 className="font-display-md text-display-md font-black text-ink-900 mb-3">Vicharanashala Internship</h1>
          <p className="font-body-lg text-body-lg italic text-ink-600 mb-6">
            Applied AI · Open-source software engineering · IIT Ropar
          </p>
          <nav className="flex flex-wrap gap-6 font-body-md text-body-md">
            <Link to="/overview" className="underline decoration-ink-900 underline-offset-4 text-ink-900">Overview</Link>
            <Link to="/faq" className="underline decoration-ink-900 underline-offset-4 text-ink-900">FAQ</Link>
            <Link to="/forum" className="underline decoration-ink-900 underline-offset-4 text-ink-900">Voice</Link>
            <a href="https://samagama.in" className="underline decoration-ink-900 underline-offset-4 text-ink-900">samagama.in</a>
          </nav>
        </header>

        <article className="space-y-10 text-ink-800">
          <section>
            <p className="font-body-lg text-body-lg leading-8">
              The Vicharanashala internship is a two-month, full-attention engagement at the lab of Prof. Sudarshan Iyengar at IIT Ropar. Interns work on real open-source software for India-centric problems, including agriculture, education, and other research-driven projects. This page explains the programme; the FAQ covers operational questions.
            </p>
          </section>

          <section>
            <h2 className="font-headline-md text-headline-md font-bold text-ink-900 mb-3">The Programme</h2>
            <p className="leading-7 mb-3">
              Every selected candidate sees a yellow VINS result panel after logging in to samagama.in. That panel contains the official next steps.
            </p>
            <h3 className="font-body-lg text-body-lg font-bold text-ink-900 mb-2">VINS — Online</h3>
            <p className="leading-7 mb-3">
              VINS is the Vicharanashala Internship track. It is open to candidates who performed well in the AI interview and is conducted entirely online, so interns work from their own location.
            </p>
            <p className="leading-7">
              You can start any time in 2026. The internship lasts two months, includes up to one month of grace, and must finish by 31 December 2026. There is no participation fee. There is generally no stipend.
            </p>
          </section>

          <section>
            <h2 className="font-headline-md text-headline-md font-bold text-ink-900 mb-3">The Four-Badge Journey</h2>
            <p className="leading-7 mb-4">
              This is the progression interns follow. Bronze and Silver are the internship proper; Gold and Platinum are additional recognition pathways.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-ink-200">
                    <th className="py-2 pr-4 font-bold text-ink-900">Badge</th>
                    <th className="py-2 pr-4 font-bold text-ink-900">Phase</th>
                    <th className="py-2 pr-4 font-bold text-ink-900">What it is</th>
                    <th className="py-2 font-bold text-ink-900">Required?</th>
                  </tr>
                </thead>
                <tbody>
                  {badgeJourney.map(([badge, phase, meaning, required]) => (
                    <tr key={badge} className="border-b border-ink-100 align-top">
                      <td className="py-3 pr-4 font-bold">{badge}</td>
                      <td className="py-3 pr-4">{phase}</td>
                      <td className="py-3 pr-4 leading-7">{meaning}</td>
                      <td className="py-3">{required}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-headline-md text-headline-md font-bold text-ink-900 mb-3">What We Expect</h2>
            <p className="leading-7 mb-3">
              This is a serious internship, not a casual summer activity. Plan for 6 to 10 hours of focused work a day, sometimes more, for the full window. The most common reason interns drop out is competing commitments such as exams, other internships, job hunts, travel, or fragmented availability.
            </p>
            <p className="leading-7 mb-3">
              Attendance and participation are tracked strictly. Over a rolling five-working-day window, interns are expected to attend at least 85% of live Zoom session time, respond to at least 85% of in-session polls and quizzes, and attempt every quiz with a pass mark of at least 50%.
            </p>
            <p className="leading-7">
              Completing both Bronze and Silver earns a certificate from Vicharanashala at IIT Ropar. If a student drops out, the certificate is not issued.
            </p>
          </section>

          <section>
            <h2 className="font-headline-md text-headline-md font-bold text-ink-900 mb-3">Project, Technology, Domain</h2>
            <p className="leading-7 mb-3">
              The exact project is not pre-declared. The programme is problem-centred: based on each intern's inclination and background, the mentor assigns a real lab problem, and the intern learns the technology required to solve it.
            </p>
            <p className="leading-7">
              Work may involve AI/ML, NLP, LLMs, web development, systems, agriculture-tech, education technology, open-source infrastructure, or another area that fits the lab's needs.
            </p>
          </section>

          <section>
            <h2 className="font-headline-md text-headline-md font-bold text-ink-900 mb-3">Why The Interview Is On Samagama</h2>
            <p className="leading-7 mb-3">
              Every candidate goes through a structured AI-led interview on samagama.in with Yaksha. The goal is to give every applicant the same calibrated conversation regardless of college brand, geography, or network.
            </p>
            <p className="leading-7">
              The interview is the formal assessment for this cycle. There is no separate test, coding round, or shortlist call. The yellow VINS result panel confirms selection and contains the canonical procedure for next steps.
            </p>
          </section>

          <section>
            <h2 className="font-headline-md text-headline-md font-bold text-ink-900 mb-3">Logistics In Brief</h2>
            <ul className="space-y-3 leading-7">
              <li><strong>Result panel.</strong> Visible on samagama.in for one week after results are declared. Read it, opt in to VINS, and complete the NOC step within the window.</li>
              <li><strong>NOC.</strong> A No-Objection Certificate from the institution, signed and stamped by an authorised signatory such as HOD, Acting HOD, Principal, Dean, or equivalent officer.</li>
              <li><strong>Offer letter.</strong> Issued provisionally through self-declaration or after NOC validation. Formal internship work begins only after the official NOC is uploaded and validated.</li>
              <li><strong>During the internship.</strong> Discord is used for community, Zoom for meetings, GitHub for code, and Yaksha chat for one-on-one queries.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline-md text-headline-md font-bold text-ink-900 mb-3">Cost</h2>
            <p className="leading-7 mb-3">
              The internship is free. Vicharanashala does not charge for the course, mentorship, or any part of the programme.
            </p>
            <p className="leading-7">
              The lab is funded through initiatives, schemes, and funding agencies that cover the cost involved. Because the opportunity is subsidised, the participation bar is deliberately high. Strong performers may be considered for selected stipends.
            </p>
          </section>

          <section>
            <h2 className="font-headline-md text-headline-md font-bold text-ink-900 mb-3">What To Do Next</h2>
            <ol className="list-decimal pl-6 space-y-2 leading-7">
              <li>Go to samagama.in and sign in.</li>
              <li>Read your yellow VINS result panel carefully.</li>
              <li>Tell Yaksha you want to opt in to VINS, using the exact phrase shown on the panel.</li>
              <li>Download the NOC, get it signed and stamped, and upload it back through the panel.</li>
              <li>Wait for your offer letter, then show up on your start date with full attention.</li>
            </ol>
            <p className="leading-7 mt-4">
              If you have a personal-case question, log in to samagama.in and ask Yaksha.
            </p>
          </section>
        </article>
      </main>
      <ChatbotWidget />
    </div>
  );
}
