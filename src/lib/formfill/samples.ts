import type { FormTemplate, Profile, ProfileField, Section } from "./types";

export const AMINA_ID = "p-amina";
export const FARHAN_ID = "p-farhan";
export const SAMPLE_TIME = Date.UTC(2026, 10, 2);

function field(id: string, label: string, value: string, keys: string[]): ProfileField {
  return { id, label, value, keys };
}

function section(id: string, title: string, fields: ProfileField[]): Section {
  return { id, title, fields };
}

export function createSeedProfiles(): Profile[] {
  return [
    {
      id: AMINA_ID,
      name: "Amina Qureshi",
      who: "You",
      updatedAt: SAMPLE_TIME,
      sections: [
        section("s-amina-id", "Identity", [
          field("f-amina-name", "Full name", "Amina Qureshi", [
            "full name",
            "full legal name",
            "legal name",
            "student full name",
          ]),
          field("f-amina-pref", "Preferred name", "Amina", ["preferred name", "nickname"]),
          field("f-amina-dob", "Date of birth", "19 June 1994", [
            "date of birth",
            "birth date",
            "dob",
          ]),
          field("f-amina-gender", "Gender", "Female", ["gender", "sex"]),
        ]),
        section("s-amina-contact", "Contact", [
          field("f-amina-email", "Email", "amina.qureshi@example.com", [
            "email",
            "email address",
          ]),
          field("f-amina-mobile", "Mobile", "+91 98450 22018", [
            "mobile",
            "mobile number",
            "phone",
            "phone number",
          ]),
          field("f-amina-alt", "Alternate phone", "+91 80 4123 9001", [
            "alternate phone",
            "alternate mobile",
          ]),
        ]),
        section("s-amina-addr", "Address", [
          field("f-amina-addr", "Address", "14, 3rd Cross, Cooke Town", [
            "address",
            "home address",
            "current address",
            "address line",
          ]),
          field("f-amina-city", "City", "Bengaluru", ["city", "town"]),
          field("f-amina-state", "State", "Karnataka", ["state"]),
          field("f-amina-pin", "PIN code", "560038", ["pin", "pin code", "pincode", "postal code"]),
        ]),
        section("s-amina-work", "Work", [
          field("f-amina-role", "Current role", "Product designer", [
            "current role",
            "job title",
            "current job title",
            "designation",
          ]),
          field("f-amina-employer", "Employer", "Fieldnote Studio", [
            "employer",
            "company",
            "current employer",
            "organization",
          ]),
          field("f-amina-li", "LinkedIn", "linkedin.com/in/aminaqureshi", ["linkedin"]),
        ]),
        section("s-amina-edu", "Education", [
          field("f-amina-degree", "Highest qualification", "B.Des, Communication Design", [
            "highest qualification",
            "highest degree",
            "degree",
            "qualification",
          ]),
          field("f-amina-school", "Institution", "National Institute of Design", [
            "institution",
            "college",
            "university",
          ]),
          field("f-amina-year", "Year finished", "2018", ["year finished", "graduation year"]),
        ]),
        section("s-amina-em", "Emergency", [
          field("f-amina-em-name", "Emergency contact name", "Yusuf Qureshi", [
            "emergency contact name",
            "emergency contact",
          ]),
          field("f-amina-em-rel", "Emergency contact relation", "Spouse", [
            "emergency contact relation",
            "relation",
          ]),
          field("f-amina-em-phone", "Emergency contact phone", "+91 98450 77821", [
            "emergency contact phone",
            "emergency phone",
          ]),
        ]),
      ],
    },
    {
      id: FARHAN_ID,
      name: "Farhan Qureshi",
      who: "Child",
      updatedAt: SAMPLE_TIME,
      sections: [
        section("s-farhan-id", "Identity", [
          field("f-farhan-name", "Full name", "Farhan Qureshi", [
            "full name",
            "full legal name",
            "legal name",
            "student full name",
            "student name",
          ]),
          field("f-farhan-dob", "Date of birth", "4 August 2016", [
            "date of birth",
            "birth date",
            "dob",
          ]),
        ]),
        section("s-farhan-school", "School", [
          field("f-farhan-class", "Class", "6", ["class", "standard", "grade"]),
        ]),
        section("s-farhan-em", "Emergency", [
          field("f-farhan-em-name", "Emergency contact name", "Amina Qureshi", [
            "emergency contact name",
            "emergency contact",
          ]),
          field("f-farhan-em-rel", "Emergency contact relation", "Mother", [
            "emergency contact relation",
            "relation",
          ]),
          field("f-farhan-em-phone", "Emergency contact phone", "+91 98450 22018", [
            "emergency contact phone",
            "emergency phone",
          ]),
        ]),
      ],
    },
  ];
}

export const FORMS: FormTemplate[] = [
  {
    id: "clinic",
    kind: "web",
    kicker: "Victoria Layout Clinic",
    title: "New patient sheet",
    source: "Sample website form",
    fields: [
      { id: "c-name", label: "Full legal name", group: "About you", kind: "text" },
      { id: "c-dob", label: "Date of birth", group: "About you", kind: "text" },
      { id: "c-sex", label: "Sex", group: "About you", kind: "text" },
      { id: "c-mobile", label: "Mobile number", group: "Contact", kind: "text" },
      { id: "c-email", label: "Email address", group: "Contact", kind: "text" },
      { id: "c-addr", label: "Home address", group: "Contact", kind: "text" },
      { id: "c-city", label: "City", group: "Contact", kind: "text" },
      { id: "c-pin", label: "PIN code", group: "Contact", kind: "text" },
      { id: "c-em-name", label: "Emergency contact name", group: "Emergency", kind: "text" },
      { id: "c-em-phone", label: "Emergency contact phone", group: "Emergency", kind: "text" },
      { id: "c-employer", label: "Employer", group: "Work", kind: "text" },
      { id: "c-allergy", label: "Known allergies", group: "Clinical", kind: "text" },
      { id: "c-insurance", label: "Insurance member ID", group: "Clinical", kind: "text" },
    ],
  },
  {
    id: "rental",
    kind: "web",
    kicker: "Indiranagar lets",
    title: "2BHK application",
    source: "Sample website form",
    fields: [
      { id: "r-name", label: "Full name", group: "Applicant", kind: "text" },
      { id: "r-email", label: "Email", group: "Applicant", kind: "text" },
      { id: "r-phone", label: "Mobile number", group: "Applicant", kind: "text" },
      { id: "r-addr", label: "Current address", group: "Applicant", kind: "text" },
      { id: "r-city", label: "City", group: "Applicant", kind: "text" },
      { id: "r-employer", label: "Current employer", group: "Work", kind: "text" },
      { id: "r-income", label: "Monthly income", group: "Work", kind: "text" },
      { id: "r-pan", label: "PAN", group: "Work", kind: "text" },
      { id: "r-em", label: "Emergency contact", group: "Emergency", kind: "text" },
      { id: "r-move", label: "Move-in date", group: "Tenancy", kind: "text" },
    ],
  },
  {
    id: "library",
    kind: "web",
    kicker: "City library",
    title: "Weekend desk application",
    source: "Sample website form",
    fields: [
      { id: "j-name", label: "Legal name", group: "You", kind: "text" },
      { id: "j-email", label: "Email address", group: "You", kind: "text" },
      { id: "j-phone", label: "Phone number", group: "You", kind: "text" },
      { id: "j-city", label: "City", group: "You", kind: "text" },
      { id: "j-degree", label: "Highest degree", group: "Background", kind: "text" },
      { id: "j-college", label: "College or university", group: "Background", kind: "text" },
      { id: "j-year", label: "Graduation year", group: "Background", kind: "text" },
      { id: "j-role", label: "Current job title", group: "Background", kind: "text" },
      { id: "j-ref", label: "Reference phone", group: "Background", kind: "text" },
      {
        id: "j-why",
        label: "Why this role",
        group: "Background",
        kind: "textarea",
      },
    ],
  },
  {
    id: "trip",
    kind: "paper",
    kicker: "St. Brigid School, Indiranagar",
    title: "Class trip consent",
    source: "Paper form facsimile",
    fields: [
      { id: "t-name", label: "Student's full name", group: "Student", kind: "text" },
      { id: "t-class", label: "Class / standard", group: "Student", kind: "text" },
      { id: "t-dob", label: "Date of birth", group: "Student", kind: "text" },
      { id: "t-school", label: "School name", group: "Student", kind: "text" },
      { id: "t-parent", label: "Parent or guardian name", group: "Parent", kind: "text" },
      { id: "t-pmobile", label: "Parent mobile", group: "Parent", kind: "text" },
      { id: "t-teacher", label: "Class teacher", group: "School", kind: "text" },
      { id: "t-allergy", label: "Allergies", group: "School", kind: "text" },
    ],
  },
];

export function formById(id: string): FormTemplate {
  return FORMS.find((form) => form.id === id) ?? FORMS[0]!;
}

export const SAMPLE_RESUME = `Asha Menon
Product designer

Email: asha.menon@example.com
Mobile: +91 98451 66310
Date of birth: 12 March 1998
Gender: Female
Address: 88, Michael Palya
City: Bengaluru
State: Karnataka
PIN code: 560075
LinkedIn: linkedin.com/in/ashamenon
Employer: North Glass
Current role: Product designer

EXPERIENCE
North Glass — Product designer (2021–present)
Fieldnote Studio — Design intern (2019–2021)

EDUCATION
B.Des Communication Design, National Institute of Design, 2019

SKILLS
Research, interface design, workshop facilitation

Based in Bengaluru. Portfolio on request.
`;

export const WHO_OPTIONS = ["You", "Child", "Parent", "Partner", "Colleague", "Other"] as const;
