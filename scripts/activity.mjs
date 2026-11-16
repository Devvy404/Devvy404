// Uses the unmodified MIT-licensed lowlighter/metrics isocalendar plugin.
// Source: 366f8b9dfe3a59656c67d5dcad9950f59c9bc96d; see vendor/LICENSE.metrics.
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import isocalendar from './vendor/isocalendar.mjs';

const login = 'Devvy404';
const result = await isocalendar({
  login, data: {}, account: {}, q: { isocalendar: true },
  imports: {
    metadata: { plugins: { isocalendar: {
      enabled: () => true, inputs: () => ({ duration: 'half-year' }),
    } } },
    format: { error: error => error },
  },
  queries: { isocalendar: { calendar: ({ login, from, to }) =>
    `query { user(login: "${login}") { calendar: contributionsCollection(from: "${from}", to: "${to}") { contributionCalendar { weeks { contributionDays { contributionCount color date } } } } } }`,
  } },
  graphql: async query => {
    const response = JSON.parse(execFileSync('gh', ['api', 'graphql', '-f', `query=${query}`], { encoding: 'utf8' }));
    if (response.errors) throw new Error('GitHub calendar query failed');
    return response.data;
  },
}, { enabled: true });

if (!result?.svg) throw new Error('Calendar was not generated');
const calendar = result.svg.replace('style="margin-top: -130px;"', 'x="200" y="100" width="500" height="230"');
const fittedCalendar = calendar.replace('viewBox="0,0 480,170"', 'viewBox="-5,-5 245,180"');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="410" viewBox="0 0 900 410" role="img" aria-label="Devvy404 contribution calendar">
<rect width="900" height="410" rx="18" fill="#101720"/>
<rect x=".5" y=".5" width="899" height="409" rx="18" fill="none" stroke="#263241"/>
<g font-family="Segoe UI,Arial,sans-serif">
<text x="32" y="39" fill="#7f95ad" font-size="12" letter-spacing="3">GITHUB / ACTIVITY LANDSCAPE</text>
<text x="32" y="78" fill="#e6edf3" font-size="26" font-weight="600">Small steps. Real progress.</text>
<text x="868" y="40" text-anchor="end" fill="#7f95ad" font-size="12">LAST 6 MONTHS</text>
${fittedCalendar}
<path d="M32 340H868" stroke="#263241"/>
<text x="32" y="372" fill="#e6edf3" font-size="20" font-weight="600">${result.streak.max} days</text>
<text x="32" y="394" fill="#7f95ad" font-size="12">Longest contribution streak</text>
<text x="340" y="372" fill="#e6edf3" font-size="20" font-weight="600">${result.max}</text>
<text x="340" y="394" fill="#7f95ad" font-size="12">Most contributions in a day</text>
<text x="650" y="372" fill="#e6edf3" font-size="20" font-weight="600">${result.average}</text>
<text x="650" y="394" fill="#7f95ad" font-size="12">Contributions per day · average</text>
</g></svg>`;
writeFileSync(new URL('../assets/activity.svg', import.meta.url), svg);
console.log('Generated activity.svg using lowlighter/metrics');

const mobile = svg.replace('width="900" height="410" viewBox="0 0 900 410"', 'width="460" height="410" viewBox="0 0 460 410"')
  .replace('width="900" height="410"', 'width="460" height="410"').replace('width="899"', 'width="459"')
  .replace('x="200" y="100" width="500" height="230"', 'x="30" y="105" width="400" height="225"')
  .replace(/<text x="868"[^<]*>LAST 6 MONTHS<\/text>/, '')
  .replace('M32 340H868', 'M32 340H428').replaceAll('x="340"', 'x="190"').replaceAll('x="650"', 'x="340"')
  .replace('Longest contribution streak', 'Best streak').replace('Most contributions in a day', 'Peak / day').replace('Contributions per day · average', 'Daily average');
writeFileSync(new URL('../assets/activity-mobile.svg', import.meta.url), mobile);
