// The words of the Terms of Service and Privacy Policy, shown at /terms and /privacy.
// Written by Sarah (Oct 5, 2026 versions) and copied here word for word by scratchpad/md-to-legal.py.
// A paragraph is a string; a bulleted list is an array of strings; a table is { table: rows }.
// "**Label.** rest" bolds the label. Change the wording here, and update EFFECTIVE when you do.

export const COMPANY = "Marquee Identity, Inc.";
export const LEGAL_EMAIL = "hello@marquee.bio";
export const EFFECTIVE = "October 5, 2026";

export type LegalBlock = string | string[] | { table: string[][] };
export type LegalSection = { h: string; body: LegalBlock[] };

export const TERMS_INTRO: LegalBlock[] = [
  "Effective October 5, 2026 · See also our [Privacy Policy](https://marquee.bio/privacy)",
  "These Terms of Service (\"Terms\") are a binding agreement between you and Marquee Identity, Inc. (\"Marquee\", \"we\", \"us\"). They cover marquee.bio, the profile builder, public profiles and Mobile Links pages, bookings and payments, and everything else we offer (together, the \"Service\").",
  "By creating an account, paying for a membership, booking or contacting a member, or otherwise using the Service, you agree to these Terms and to our Privacy Policy. If you do not agree, do not use the Service. If you use the Service for a company or other organisation, you confirm you have authority to accept these Terms for it."
];

export const TERMS: LegalSection[] = [
  {
    "h": "1. Who can use Marquee",
    "body": [
      "You must be at least 18 years old and able to enter a binding contract. You must give accurate information and keep it current.",
      "One person, one account. You may not create an account for someone else without their permission, pretend to be someone you are not, or share, sell or transfer your account.",
      "You are responsible for your password and for everything done through your account. Tell us at once at hello@marquee.bio if you think someone else has access."
    ]
  },
  {
    "h": "2. The Service, and beta",
    "body": [
      "Marquee lets professionals build and publish a profile, show how people can work with them, take bookings and payments, and be found by visitors and search engines.",
      "Marquee is in beta. Features may change, be limited, break or be removed, and we may limit how many members we accept. We aim to keep the Service available but do not promise any level of uptime, and we may carry out maintenance at any time.",
      "We may show sample profiles of invented people to demonstrate the product. These are labelled as samples.",
      "Some features use automated tools, including third-party AI services, for example to read a resume or website and draft profile content. Their output can be wrong. You are responsible for checking it before you publish. Only submit material you have the right to share. Our Privacy Policy explains how we collect, use and share personal information, including in connection with automated and AI-assisted features. We also use relevant professional information and activity within Marquee to develop, train, test and improve Marquee’s own models for search, matching and recommendations, as explained in section 7 of our Privacy Policy. This does not include private messages, booking notes, support correspondence, passwords, payment card details, bank details or identity-verification documents. These Terms do not give us permission to use private submissions in public promotional materials. We will obtain separate consent where applicable law requires it."
    ]
  },
  {
    "h": "3. Membership, billing and cancellation",
    "body": [
      [
        "**Plans.** Membership is a paid subscription, billed monthly or yearly in advance through Stripe, our payment processor. Prices are shown before you pay.",
        "**Founding Member price.** If you join as a Founding Member, your price stays the same for as long as your membership remains active without a break. If your membership ends for any reason, the Founding Member price ends with it.",
        "**Automatic renewal.** Your membership renews automatically at the end of each period, at the then-current price for your plan, or your locked Founding Member price where applicable, until you cancel. You authorise us to charge your payment method each period.",
        "**Cancelling.** You can cancel at any time. Cancelling stops future charges. Your membership stays active until the end of the period you have already paid for.",
        "**Refunds.** Except where the law requires otherwise, or where we remove your account without cause under section 11, payments are not refunded for partial periods or unused time.",
        "**Failed payments.** If a payment fails, we may retry it, and we may suspend or end your membership and unpublish your profile until it is paid.",
        "**Price changes.** We may change prices for future periods and will give you at least 30 days' notice by email. This does not affect a Founding Member price that is still locked.",
        "**Taxes.** Prices do not include taxes we are required to collect, which are added at checkout.",
        "**Invite codes and promotions.** Free or discounted access is subject to the terms disclosed with the offer, has no cash value, and may be withdrawn for future sign-ups. Withdrawing an offer does not change a locked Founding Member price for an existing, continuously active membership."
      ]
    ]
  },
  {
    "h": "4. Your content",
    "body": [
      "\"Your content\" is everything you add to Marquee: your photo, bio, experience, media, testimonials, products, rates, links and anything else on your profile.",
      [
        "**You own it.** We claim no ownership of your content.",
        "**Your permission to us.** You give Marquee a worldwide, non-exclusive, royalty-free licence to host, store, copy, format, display and distribute your content as needed to operate and improve the Service, including processing relevant professional information to develop, train, test and improve Marquee’s own search, matching and recommendation models as described in our Privacy Policy and subject to applicable law. For content you make public, this also includes permission to feature your name, photo and public profile content in Marquee search results, directories, curated talent lists, Spotlight articles, editorial features, social media, and marketing and promotional materials for Marquee. We will not materially misrepresent your content or imply that you endorse an unrelated product or service. This promotional permission does not apply to unpublished drafts, private messages or documents submitted only to help build your profile. The licence ends when you delete the content or your account. Model-training data and any effects on models already trained are addressed in section 7 of our Privacy Policy, subject to your rights under applicable law; this sentence does not grant permission to retain identifiable content indefinitely. We will stop new promotional uses and remove it from promotional materials we control within a reasonable time, except for routine backups, records we must retain by law, and previously distributed materials or copies shared by others.",
        "**Your promises.** You have the right to post your content. It is true and not misleading to the best of your knowledge. It does not infringe anyone's rights or break any law. Testimonials are real, and you have the person's permission to publish them with their name. Company names and logos are used only to identify organisations you have actually worked with, and do not imply endorsement.",
        "**Our rights.** We may review, refuse, hide or remove any content at any time, but we have no duty to monitor content and are not responsible for what members post."
      ]
    ]
  },
  {
    "h": "5. Your profile is public",
    "body": [
      "When you publish, your profile and Mobile Links page are visible to anyone on the internet and may be indexed by search engines and AI tools. Do not publish anything you want kept private.",
      "You control what is shown through the settings in the builder, and you can unpublish at any time. Unpublishing or deleting removes content from Marquee, but we cannot remove copies that other people or search engines have already made."
    ]
  },
  {
    "h": "6. Working with members",
    "body": [
      "Members can offer sessions and services through their profiles, and visitors (\"clients\") can book, pay for or request them.",
      [
        "**Marquee's role.** Marquee provides the venue and tools. Any agreement for a session or service is between the member and the client only. Marquee is not a party to it, is not an employer, agent, partner or representative of any member or client, and does not supervise, endorse or guarantee any member, service, result, advice or outcome.",
        "**Members are independent.** Members act as independent professionals. They decide what they offer, their prices and their availability, and they alone are responsible for delivering what they sell, for its quality and lawfulness, for any licences or qualifications their work requires, and for their own taxes and insurance.",
        "**No professional advice from Marquee.** Anything a member says or provides is the member's own. Marquee does not provide legal, financial, medical, career or other professional advice.",
        "**Your own judgement.** We do not verify everything members say about themselves. A \"Verified\" badge means only what we state it means at the time. Clients are responsible for deciding whom to hire, book or work with.",
        "**Clients.** If you book or contact a member, you agree to give accurate details, attend sessions you book, and treat members with respect."
      ]
    ]
  },
  {
    "h": "7. Payments, fees, cancellations and payouts",
    "body": [
      [
        "**Payments.** Payments are processed by Stripe. Marquee does not store full card numbers. By paying, you also agree to Stripe's terms.",
        "**Payout accounts.** To be paid, a member must open a Stripe account, complete Stripe's identity checks and accept the Stripe Connected Account Agreement. During beta, payouts are available to members in the United States only. Stripe, not Marquee, holds funds and makes payouts, and payout timing is set by Stripe.",
        "**Marquee's fee.** Marquee keeps 5% of each paid booking. Standard payment processing of 2.9% plus 30 cents is also deducted. The remainder is paid out to the member. We may change our fee for future bookings with at least 30 days' notice.",
        "**Session cancellations.** For individual appointments booked and paid for directly through Marquee, a client who cancels at least 24 hours before the scheduled start receives a full refund. A client who cancels later, or does not attend, is not entitled to a refund unless the member agrees otherwise or applicable law requires it.",
        "**Other services and offers.** Projects, fractional engagements, coaching packages, workshops, speaking and other offers may have their own cancellation, delivery and refund terms. Members must clearly disclose these terms before purchase, and clients must be able to review and accept them. Those terms may not override rights required by law. Members must not accept payment for an offer without disclosing its applicable cancellation and refund policy.",
        "**Member cancellations.** If the member cancels an individual appointment, the client is refunded in full. If a member cancels another service or offer, the disclosed terms apply, subject to applicable law; if no policy was disclosed, the client receives a refund for the undelivered portion.",
        "**Refunded bookings.** When a booking is refunded, Marquee's fee is returned as well.",
        "**Disputes and chargebacks.** Members are responsible for refunds, disputes and chargebacks on their bookings and for any related fees. We may deduct these from future payouts, and we may delay payouts or reverse transactions where we reasonably suspect fraud, error or a breach of these Terms.",
        "**Taxes.** Members are responsible for reporting and paying their own taxes. Stripe may issue tax forms.",
        "**Sales elsewhere.** Products in a member's Shop, and offers set to open a link, lead to other websites where the sale takes place. Those sales are between the buyer and that seller or site. Marquee is not involved and is not responsible for them."
      ]
    ]
  },
  {
    "h": "8. Acceptable use",
    "body": [
      "You agree not to:",
      [
        "Post anything false, misleading, defamatory, harassing, hateful, sexually explicit, violent or unlawful.",
        "Misrepresent your identity, experience, credentials, employers, clients or results.",
        "Post fake testimonials, or publish someone's words, name or image without permission.",
        "Infringe anyone's copyright, trademark, privacy, publicity or other rights.",
        "Offer or request anything illegal, or any service you are not legally permitted or qualified to provide.",
        "Send spam, or use Marquee or information obtained from it to contact people who have not asked to hear from you.",
        "Use a client's or member's contact details for anything other than the booking or request they made.",
        "Upload viruses or harmful code, or try to break, overload, probe or get around the security of the Service.",
        "Use the Service in breach of export or sanctions laws."
      ]
    ]
  },
  {
    "h": "9. Protecting the Service: no copying or scraping",
    "body": [
      "You agree not to, and not to help anyone else to:",
      [
        "Copy or reproduce Marquee's proprietary software, original text, graphics or other protected materials without permission, except as allowed by law or these Terms.",
        "Use non-public product information, confidential materials or data obtained through unauthorised access to build, train, improve or market a competing product or service.",
        "Use automated tools, false identities or unauthorised access to extract product information or member data for competitive benchmarking or analysis.",
        "Scrape, harvest or bulk-download profiles, member data or other Service content, or use such extracted content to train AI models, without our written permission. Public search engines may index public profiles as our robots file allows.",
        "Reverse engineer, decompile or attempt to extract the source code of the Service, except where applicable law expressly permits it.",
        "Remove or hide ownership notices or Marquee branding from materials provided by the Service, except through features we expressly offer."
      ],
      "These restrictions do not prevent members from using their own content elsewhere, independently developing products, or using general knowledge, skills or ideas. Working for a competitor does not, by itself, violate these Terms.",
      "We may seek injunctive relief and other remedies available under applicable law for a breach of this section."
    ]
  },
  {
    "h": "10. Marquee's property",
    "body": [
      "The Service, including its software, design, text, graphics, logos, the Marquee name and the features that make up the product, belongs to Marquee Identity, Inc. and its licensors and is protected by copyright, trademark and other laws.",
      "We give you a limited, personal, revocable, non-transferable right to use the Service to build and share your own profile, or to view profiles and book members, while you comply with these Terms. Nothing else is granted.",
      "If you send us feedback or ideas, we may use them freely, without restriction and without owing you anything."
    ]
  },
  {
    "h": "11. Suspension and removal",
    "body": [
      "Marquee is a curated community. We may refuse an application or suspend or remove an account, profile or content where we reasonably believe there is a breach of these Terms, fraud, a security risk, unlawful activity, or conduct that harms members, clients or Marquee. We may also end access if we discontinue the Service or a membership offering, or where required by law. Where reasonably practicable, we will explain the reason and give you an opportunity to address the issue. We may act immediately where needed to protect the Service or others, or where notice is legally restricted.",
      [
        "If we remove your account for breaking these Terms, you are not owed a refund.",
        "If we remove your account for any other reason, we will refund the unused part of your current membership period.",
        "You may close your account at any time. Bookings already paid for remain subject to section 7.",
        "Sections 4 (subject to its stated licence limits), 6, 7, 9, 10 and 12 to 18 continue after your account ends."
      ]
    ]
  },
  {
    "h": "12. Copyright complaints",
    "body": [
      "If you believe something on Marquee infringes your copyright, email hello@marquee.bio with: a description of the work; where the material appears on Marquee; your name and contact details; a statement that you believe in good faith the use is not authorised by the owner, its agent or the law; a statement, under penalty of perjury, that your notice is accurate and that you are the owner or authorised to act for the owner; and your signature.",
      "We remove infringing material, and we close the accounts of repeat infringers. If your content was removed and you believe that was a mistake, you may send us a counter-notice at the same address."
    ]
  },
  {
    "h": "13. Other websites and services",
    "body": [
      "Profiles contain links to other websites, and the Service relies on other companies' services, such as Stripe. We do not control them and are not responsible for their content, terms or practices."
    ]
  },
  {
    "h": "14. Messages from us",
    "body": [
      "By creating an account you agree to receive emails about your account, membership, bookings and requests. We may also send product news, which you can unsubscribe from at any time. If we offer text messages, we will ask for your consent first. You agree that electronic notices satisfy any legal requirement that a notice be in writing."
    ]
  },
  {
    "h": "15. Disclaimers",
    "body": [
      "The Service is provided \"as is\" and \"as available\". To the fullest extent the law allows, Marquee disclaims all warranties, express or implied, including merchantability, fitness for a particular purpose, title and non-infringement.",
      "We do not promise that the Service will be uninterrupted, secure or error-free, that content will not be lost, that your profile will appear in any search result, or that you will gain clients, income, employment or opportunities."
    ]
  },
  {
    "h": "16. Limit of liability",
    "body": [
      "To the fullest extent the law allows, Marquee and its officers, employees and suppliers are not liable for any indirect, incidental, special, consequential, exemplary or punitive damages, or for lost profits, revenue, data, goodwill or opportunities, however caused, even if told they were possible.",
      "Marquee is not liable for the acts or omissions of any member or client, for any service a member provides or fails to provide, or for any dealings between members and clients.",
      "To the fullest extent the law allows, our total liability for all claims relating to the Service is limited to the greater of the membership charges and platform fees you paid Marquee in the 12 months before the claim arose, or 100 US dollars. Amounts paid to members for their services are excluded from this calculation. Nothing in these Terms limits liability that cannot lawfully be limited, including liability for fraud or intentional misconduct where such a limitation is prohibited.",
      "Some places do not allow certain exclusions or limits, so parts of sections 15 and 16 may not apply to you."
    ]
  },
  {
    "h": "17. Your responsibility to us",
    "body": [
      "To the fullest extent the law allows, you will defend Marquee and its officers and employees against third-party claims arising from your content, the services you offer or provide, your dealings with members or clients, your breach of these Terms, or your breach of any law or anyone's rights, and cover resulting damages and reasonable legal costs. This obligation does not apply to the extent a claim arises from Marquee's own breach of these Terms, negligence or intentional misconduct.",
      "We will notify you promptly of a claim, reasonably cooperate with the defence at your expense, and allow you to control the defence with reasonably acceptable counsel. You may not settle a claim in a way that admits fault by Marquee or imposes obligations on Marquee without our written consent, which we will not unreasonably withhold."
    ]
  },
  {
    "h": "18. Governing law and disputes",
    "body": [
      "Before filing a claim, you and Marquee will each try in good faith to resolve it by writing to the other and allowing 30 days to respond. Write to us at hello@marquee.bio. This does not prevent either party from seeking urgent court relief, meeting a legal filing deadline or using rights that cannot be waived by law.",
      "These Terms are governed by the laws of the State of Delaware, without regard to conflict-of-law rules, and applicable federal law. Subject to any mandatory rights you have under applicable law, disputes will be brought in the state courts located in Delaware or, where federal jurisdiction exists, the United States District Court for the District of Delaware. You and Marquee consent to those courts' jurisdiction.",
      "Nothing in these Terms takes away non-waivable consumer protections, access to a court that applicable law requires to remain available, or the right to bring an eligible individual claim in a small claims court with jurisdiction. Claims are subject to the filing deadlines provided by applicable law."
    ]
  },
  {
    "h": "19. Changes to these Terms",
    "body": [
      "We may update these Terms. If a change is significant, we will email members or post a notice at least 14 days before it takes effect. Continuing to use the Service after that date means you accept the new Terms. If you do not accept them, cancel before the change takes effect."
    ]
  },
  {
    "h": "20. General",
    "body": [
      "These Terms and the Privacy Policy are the whole agreement between you and Marquee about the Service. If a court finds part of them unenforceable, the rest still applies. If we do not enforce a right, we have not given it up. You may not transfer your rights under these Terms; we may transfer ours as part of a merger, sale or reorganisation. We are not responsible for delays or failures caused by events beyond our reasonable control. Nothing in these Terms creates a partnership, employment or agency relationship between you and Marquee."
    ]
  },
  {
    "h": "21. Contact",
    "body": [
      "Marquee Identity, Inc. · hello@marquee.bio"
    ]
  }
];

export const PRIVACY_INTRO: LegalBlock[] = [
  "This Privacy Policy explains what Marquee Identity, Inc. (\"Marquee\", \"we\", \"us\") collects through marquee.bio, how we use it, who we share it with, and the choices you have. It applies to members, visitors, and clients who book or contact a member.",
  "We do not sell personal information or share it for cross-context behavioural advertising."
];

export const PRIVACY: LegalSection[] = [
  {
    "h": "1. What we collect from members",
    "body": [
      [
        "**Account details.** Name, email address and sign-in credentials. Passwords are stored in hashed form, not readable plain text.",
        "**Profile content.** Photo, bio, experience, skills, values, leadership details, testimonials, media, products, rates, social links and anything else you add.",
        "**Optional details.** Date of birth, personality types and audience numbers, if you choose to add them.",
        "**Files and websites you give us.** A resume or LinkedIn PDF you upload, a website you ask us to read, and the text extracted from them.",
        "**Availability.** Your available times, time zone and meeting link.",
        "**Membership.** Your plan, billing dates, status and payment records. Card details go directly to Stripe; we do not store full card numbers.",
        "**Payout status.** Whether your Stripe payout account is connected and ready, and information needed to administer payments. Stripe collects bank and identity details for its payment and verification services.",
        "**Messages to us.** Feedback, support requests and emails."
      ],
      "Please do not upload government identification, bank details, health records or other sensitive information to your profile or profile-building tools. Only submit information about other people that you have permission or another lawful basis to share."
    ]
  },
  {
    "h": "2. What we collect from visitors and clients",
    "body": [
      [
        "**Bookings.** Your name, email address, the session chosen, its time and anything you write in booking notes. Card details go directly to Stripe.",
        "**Requests and enquiries.** Your name, email address and the message you send to a member.",
        "**Affirmations.** Your name and relationship to a member when you affirm their superpower, and the affirmation you submit.",
        "**Waitlist and reminders.** Your email address and the updates or reminders you request."
      ]
    ]
  },
  {
    "h": "3. What we collect automatically",
    "body": [
      [
        "**Usage information.** Pages viewed, referring page, device and browser type, general region, and activity within Marquee, such as searches and interactions with profiles and discovery features. We use this information to understand usage and improve discovery. Our analytics do not use advertising cookies or track you across unrelated sites.",
        "**Log information.** IP address, date and time, and technical details of requests, used for security and troubleshooting.",
        "**Cookies and similar storage.** We use these to keep you signed in and remember your settings. We do not use advertising cookies. You can manage cookies through your browser, although blocking essential cookies may prevent some features from working."
      ],
      "Browser \"Do Not Track\" signals do not have a uniform standard, and we do not change our practices in response to them. Global Privacy Control is a separate signal concerning certain privacy choices; we honour applicable opt-out requirements where required by law. We do not currently sell personal information or share it for cross-context behavioural advertising."
    ]
  },
  {
    "h": "4. How we use information",
    "body": [
      "We use information to:",
      [
        "Create, show and host your profile and Mobile Links page.",
        "Draft profile text and keywords from a resume or website you provide.",
        "Take membership payments and process bookings, refunds and payouts.",
        "Send emails about your account, membership, bookings and requests.",
        "Help people find members through available Marquee discovery features and external search engines.",
        "Develop, train, test and improve Marquee’s models for professional search, matching and recommendations using professional profile information, relevant information extracted from resumes or websites you submit, and activity within Marquee. Section 7 explains these uses and their limits.",
        "Feature public profile content in directories, curated talent lists, Spotlight articles, editorial features, social media, and Marquee marketing, as described in our Terms.",
        "Keep the Service secure, prevent fraud and abuse, and enforce our Terms.",
        "Understand how the Service is used and improve it.",
        "Send product news, which you can unsubscribe from.",
        "Meet legal, tax and accounting obligations."
      ],
      "Where the law requires a legal basis, we rely on performing our contract with you; our legitimate interests in operating, securing and improving the Service and helping members be discovered; your consent where required; and compliance with legal obligations. Where we rely on legitimate interests, we consider your rights and reasonable expectations."
    ]
  },
  {
    "h": "5. What is public",
    "body": [
      "A published profile is public. Anyone can see it, and search engines and AI tools may index it. This includes your name, photo, title, location and the sections you choose to show. Affirmations and testimonials displayed on a public profile may also identify the person who provided them.",
      "We do not automatically display your account email address, date of birth, password, payment details or payout details on your profile. If you add contact details or other personal information to public text, media or links yourself, that information will be public.",
      "You control what is shown through the builder and can unpublish at any time. Public content may also appear in Marquee features and promotional materials described in section 4. The limits on that use, including what happens after deletion, are explained in our Terms.",
      "Unpublishing or deletion does not remove copies already made by other people, search engines or third-party AI tools. Uploaded source files, unpublished drafts and private booking notes are not made public merely because you publish a profile."
    ]
  },
  {
    "h": "6. Who we share information with",
    "body": [
      "We share information as described below.",
      "**Service providers.** We use providers to operate the Service, including:",
      {
        "table": [
          [
            "Provider",
            "Purpose and information involved"
          ],
          [
            "Supabase",
            "Database and sign-in: account information, profile content, bookings and related application records."
          ],
          [
            "Vercel",
            "Website hosting and analytics: information processed to deliver pages, usage information and technical logs."
          ],
          [
            "Stripe",
            "Membership payments, booking payments and payouts: payment and transaction information, and bank and identity details submitted to Stripe."
          ],
          [
            "Resend",
            "Email delivery: email addresses and the content of emails we send."
          ],
          [
            "Anthropic",
            "AI-assisted profile drafting: text extracted from a resume or website you provide and related instructions needed to produce suggestions."
          ]
        ]
      },
      "We provide information needed for these services. Providers process information under applicable agreements with us. Some, including Stripe, may also process information for their own legal, security, fraud-prevention and compliance obligations under their privacy policies.",
      "**Between members and clients.** When a client books or sends a request, the member receives the client's name, email address and relevant booking details or message. The client receives the member's meeting details where needed. Our Terms require each party to use these details only for that booking or request. Members are responsible for their own handling of client information; contact them directly about information they retain outside Marquee.",
      "**Public features and promotion.** Public profile content may be shared with visitors, search engines and audiences of Marquee's editorial, social and promotional materials, as described in sections 4 and 5.",
      "**Legal and safety.** We may disclose information where required by law or where reasonably necessary to protect the rights, property or safety of Marquee, our members or others.",
      "**Business changes.** Information may be transferred as part of a merger, acquisition, financing, sale or reorganisation. Any recipient must handle it consistently with this policy and applicable law unless a lawful change is made with any required notice or consent."
    ]
  },
  {
    "h": "7. AI, model training and discovery",
    "body": [
      "**Profile assistance.** We use AI to read resumes and websites you provide and suggest profile text and keywords. Relevant text and instructions are sent to our AI provider. Suggestions can be inaccurate; review them before publishing. You choose what to publish.",
      "**Marquee’s models.** We use professional profile information, relevant professional information extracted from resumes and websites you submit, and activity within Marquee to develop, train, test and improve our own models for search, matching and recommendations. Professional information may include experience, skills, interests, work preferences, services, availability and other details you provide to help people understand your work. This may include relevant professional information you have not published. Using it internally does not make it public.",
      "We do not use private messages, booking notes, support correspondence, passwords, payment card details, bank details or identity-verification documents to train these models. We limit training data to information relevant to professional discovery and do not use date of birth for model training.",
      "**Providers and public content.** Marquee’s use of information to train its own models is separate from processing by third-party AI providers. Providers may retain submitted information for service delivery, security, abuse prevention or legal compliance under the applicable service terms. This policy does not authorise those providers to train their own general-purpose models using your information. Our Terms prohibit unauthorised scraping and use of extracted member profiles for third-party AI training. Public pages may nevertheless be indexed by search engines and AI tools, and we cannot guarantee how unauthorised third parties use public information.",
      "**Your choices.** You can edit or remove profile information and request account deletion under section 8. Unpublishing controls public visibility; it does not by itself stop internal processing described here. Deletion of source data does not necessarily reverse its effect on a model already trained. We will assess requests concerning training data and models under applicable law; this does not limit your legal rights to deletion, objection or restriction. Where consent is required for a training use, we will obtain it before that use begins.",
      "Features change during beta; this policy does not mean every search, matching or recommendation feature is currently available. If we introduce materially different uses of personal information, we will update this policy and provide any notice or consent required by law before those uses begin."
    ]
  },
  {
    "h": "8. Your choices and rights",
    "body": [
      [
        "**See and change your information.** Edit your profile and available account settings in the builder.",
        "**Hide or unpublish.** Hide available sections or unpublish your profile.",
        "**Delete your account.** Email hello@marquee.bio to request deletion of your account and profile, subject to records we must retain under section 9.",
        "**Get a copy.** Ask for a copy of the personal information we hold about you and, where applicable, a portable copy.",
        "**Correct it.** Ask us to fix inaccuracies you cannot change yourself.",
        "**Emails.** Unsubscribe from product news using the link in an email. We will still send necessary account, booking and payment messages.",
        "**Clients and visitors.** Email us about information collected through a booking, request, affirmation or waitlist sign-up."
      ],
      "We aim to respond and complete account deletion requests within 30 days. Applicable law may permit or require a different deadline or an extension; we will explain any extension as required. We may need to verify your identity or an agent's authority. We do not charge for ordinary requests or discriminate against you for exercising your rights. If we cannot fulfil a request, we will explain why and provide any appeal options required by law."
    ]
  },
  {
    "h": "9. How long we keep information",
    "body": [
      "We retain information only as needed for the purposes in this policy, including legal requirements, security and resolving disputes.",
      [
        "**Account and profile information.** Generally until you delete your account, subject to necessary legal, transaction and security records.",
        "**Uploaded resumes and extracted website text.** Only as long as needed to extract relevant professional information and draft your profile. Extracted professional information used for search, matching, recommendations or model development may be retained while your account is active, subject to deletion requests and applicable law. Published profile text remains until you remove it or delete your account. AI-provider retention is separate, as explained in section 7.",
        "**Booking and payment records.** Generally seven years where needed for tax, accounting or legal obligations. This does not mean every booking note or unnecessary personal detail must be retained for that period.",
        "**Waitlist information.** Until you ask to be removed or the waitlist closes, unless you separately sign up for an account or other updates.",
        "**Model development data.** Relevant professional information and activity data are retained only as needed for the model development purposes described in section 7, subject to applicable rights and retention requirements. We review whether identifiable training data remains necessary. Effects on models already trained are addressed in section 7.",
        "**Technical logs.** Generally up to 90 days, with longer retention where needed to investigate a security incident, fraud or a legal matter.",
        "**Backups.** Deleted information may remain in routine backups for up to 30 days, after which it is removed through the backup cycle, unless retention is legally required."
      ],
      "We may retain information longer where a specific legal obligation, dispute or investigation requires it. We restrict its use to that purpose. Public copies held by others are outside our control."
    ]
  },
  {
    "h": "10. Security",
    "body": [
      "We use encryption in transit, access controls and service providers to help protect information. No online service can promise perfect security. If a breach requires notification, we will notify affected people and authorities as applicable law requires."
    ]
  },
  {
    "h": "11. Where information is processed",
    "body": [
      "Marquee operates from the United States. Information may be stored and processed in the United States and other countries where our service providers operate. These countries may have different data-protection rules from your own.",
      "Where applicable law requires a safeguard for an international transfer, we use a legally recognised transfer mechanism. Section 13 explains how to contact us for more information."
    ]
  },
  {
    "h": "12. California and other U.S. state residents",
    "body": [
      "Depending on where you live and which laws apply, you may have rights to access and obtain a copy of personal information, know how it is collected and disclosed, request correction or deletion, and appeal a denied request. Applicable laws may also provide rights to opt out of certain sales, targeted advertising or profiling, or to limit certain uses of sensitive information.",
      "We do not sell personal information or share it for cross-context behavioural advertising. The categories of information, sources, purposes, recipients and retention practices are described in sections 1 to 9.",
      "To make a request, email hello@marquee.bio. You may use an authorised agent where the law allows it. We may verify your identity and the agent's authority. We will not discriminate against you for exercising applicable privacy rights."
    ]
  },
  {
    "h": "13. Europe, the United Kingdom and Switzerland",
    "body": [
      "Marquee Identity, Inc. is the controller of personal information we process to operate the Service. Depending on applicable law, you may access, correct, delete or obtain a portable copy of your information; object to processing based on legitimate interests; restrict certain processing; and withdraw consent where we rely on it. Withdrawing consent does not affect the lawfulness of earlier processing.",
      "You may complain to your local data-protection authority. Contact hello@marquee.bio to exercise rights or ask about the legal basis for processing or the safeguards applicable to an international transfer, including a copy of relevant safeguards where available. Where required, transfer safeguards may include standard contractual clauses and applicable UK or Swiss adaptations, or another legally recognised mechanism."
    ]
  },
  {
    "h": "14. Children",
    "body": [
      "Marquee is for adults. We do not knowingly collect personal information from anyone under 18. If you believe a child has provided information, email us so we can investigate and remove it as appropriate."
    ]
  },
  {
    "h": "15. Changes to this policy",
    "body": [
      "If we make a significant change, we will email members or post a notice before it takes effect. We will obtain consent where required by law. The date at the top shows the latest version."
    ]
  },
  {
    "h": "16. Contact",
    "body": [
      "Marquee Identity, Inc. · hello@marquee.bio"
    ]
  }
];
