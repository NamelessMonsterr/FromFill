import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Lock, c as ArrowLeft, i as Route, o as ClipboardCheck, r as Trash2, s as ChevronRight, t as Users } from "../_libs/lucide-react.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-8_1P9-H8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STOP = /* @__PURE__ */ new Set([
	"a",
	"an",
	"the",
	"of",
	"and",
	"or",
	"to",
	"for",
	"your",
	"my",
	"please",
	"enter",
	"number",
	"no",
	"code",
	"details"
]);
var SYN = {
	mobile: "phone",
	cell: "phone",
	telephone: "phone",
	mail: "email",
	pincode: "pin",
	zip: "pin",
	postal: "pin",
	gender: "sex",
	dob: "birth",
	birthdate: "birth"
};
var GENERIC = /* @__PURE__ */ new Set([
	"name",
	"date",
	"address",
	"contact",
	"full",
	"info",
	"information",
	"person",
	"current",
	"id"
]);
var SHORT = /* @__PURE__ */ new Set([
	"email",
	"phone",
	"pin",
	"city",
	"sex",
	"name",
	"role",
	"address"
]);
var ROLE = /* @__PURE__ */ new Set([
	"parent",
	"guardian",
	"emergency",
	"mother",
	"father",
	"alternate",
	"reference",
	"billing",
	"employer",
	"work",
	"home",
	"preferred",
	"legal"
]);
var RELATED = [[
	"parent",
	"guardian",
	"emergency",
	"mother",
	"father"
]];
function norm(value) {
	return value.toLowerCase().replace(/['’]s\b/g, "").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}
function tokens(value) {
	return norm(value).split(" ").filter((token) => token && !STOP.has(token)).map((token) => SYN[token] ?? token);
}
function phrasesOf(field) {
	return [field.label, ...field.keys].map(norm).filter(Boolean);
}
function containsPhrase(hay, needle) {
	if (needle.length < 4) return false;
	return ` ${hay} `.includes(` ${needle} `);
}
function strongContain(hay, needle) {
	if (!containsPhrase(hay, needle)) return false;
	const parts = tokens(needle);
	if (parts.length >= 2) return true;
	if (parts.length === 1 && !SHORT.has(parts[0]) && !GENERIC.has(parts[0])) return true;
	return false;
}
function roleMismatch(formTokens, phraseTokens) {
	const formRoles = formTokens.filter((token) => ROLE.has(token));
	const phraseRoles = phraseTokens.filter((token) => ROLE.has(token));
	if (!formRoles.length && !phraseRoles.length) return false;
	if (!formRoles.length || !phraseRoles.length) return true;
	return !formRoles.some((token) => phraseRoles.includes(token));
}
function relatedBoost(formLabel, field) {
	const formTokens = tokens(formLabel);
	const fieldTokens = tokens(`${field.label} ${field.keys.join(" ")}`);
	for (const group of RELATED) {
		const formHit = formTokens.some((token) => group.includes(token));
		const fieldHit = fieldTokens.some((token) => group.includes(token));
		if (formHit && fieldHit) return .66;
	}
	return 0;
}
function preference(formLabel, field) {
	const formTokens = tokens(formLabel);
	const fieldTokens = tokens(`${field.label} ${field.keys.join(" ")}`);
	let score = 0;
	if (formTokens.includes("name") && fieldTokens.includes("name") && !fieldTokens.includes("phone")) score += 2;
	if (formTokens.includes("phone") && fieldTokens.includes("phone") && !fieldTokens.includes("name")) score += 2;
	return score;
}
function flatten(profile) {
	return profile.sections.flatMap((section) => section.fields.map((field) => ({
		fieldId: field.id,
		sectionId: section.id,
		sectionTitle: section.title,
		label: field.label,
		value: field.value,
		keys: field.keys
	})));
}
function suggest(field) {
	return {
		fieldId: field.fieldId,
		sectionId: field.sectionId,
		sectionTitle: field.sectionTitle,
		label: field.label,
		value: field.value
	};
}
function scorePair(formLabel, field) {
	const formNorm = norm(formLabel);
	const formTokens = tokens(formLabel);
	const fieldTokens = tokens(`${field.label} ${field.keys.join(" ")}`);
	const formOnly = formTokens.filter((token) => !fieldTokens.includes(token) && !GENERIC.has(token));
	for (const phrase of phrasesOf(field)) if (phrase === formNorm) return 1;
	if (formOnly.length) return relatedBoost(formLabel, field);
	let score = 0;
	for (const phrase of phrasesOf(field)) if (strongContain(formNorm, phrase) || strongContain(phrase, formNorm)) score = Math.max(score, .93);
	let overlap = 0;
	for (const phrase of phrasesOf(field)) {
		const phraseTokens = tokens(phrase);
		if (!formTokens.length || !phraseTokens.length) continue;
		const shared = formTokens.filter((token) => phraseTokens.includes(token));
		if (!shared.filter((token) => !GENERIC.has(token)).length) {
			const union = /* @__PURE__ */ new Set([...formTokens, ...phraseTokens]);
			overlap = Math.max(overlap, Math.min(shared.length / union.size, .48));
			continue;
		}
		if (roleMismatch(formTokens, phraseTokens)) {
			overlap = Math.max(overlap, .58);
			continue;
		}
		const union = /* @__PURE__ */ new Set([...formTokens, ...phraseTokens]);
		const jaccard = shared.length / union.size;
		overlap = Math.max(overlap, Math.min(.96, .8 + jaccard * .15));
	}
	return Math.max(score, overlap, relatedBoost(formLabel, field));
}
function bareName(formLabel, fields) {
	const formTokens = tokens(formLabel);
	if (!formTokens.length || !formTokens.every((token) => token === "name")) return null;
	const named = fields.filter((field) => tokens(`${field.label} ${field.keys.join(" ")}`).includes("name"));
	if (!named.length) return null;
	const ranked = [...named].sort((a, b) => {
		const aFull = a.keys.some((key) => norm(key) === "full name") ? 1 : 0;
		return (b.keys.some((key) => norm(key) === "full name") ? 1 : 0) - aFull;
	});
	if (named.length === 1) {
		const only = ranked[0];
		if (!only.value.trim()) return {
			status: "missing",
			value: "",
			matched: suggest(only),
			suggestions: [],
			note: `${only.label} is on the profile, but blank.`
		};
		return {
			status: "filled",
			value: only.value,
			matched: suggest(only),
			suggestions: [],
			note: `Filled from ${only.label}.`
		};
	}
	return {
		status: "unclear",
		value: "",
		matched: null,
		suggestions: ranked.slice(0, 2).map(suggest),
		note: "More than one name could fit. Not filled."
	};
}
function resolveField(formField, fields) {
	if (!fields.length) return {
		status: "missing",
		value: "",
		matched: null,
		suggestions: [],
		note: "This profile has no details yet."
	};
	const named = bareName(formField.label, fields);
	if (named) return named;
	const ranked = fields.map((field) => ({
		field,
		score: scorePair(formField.label, field)
	})).sort((a, b) => b.score - a.score || preference(formField.label, b.field) - preference(formField.label, a.field) || Number(Boolean(b.field.value.trim())) - Number(Boolean(a.field.value.trim())));
	const best = ranked[0];
	const second = ranked[1];
	if (!best || best.score < .45) return {
		status: "missing",
		value: "",
		matched: null,
		suggestions: [],
		note: "Nothing on this profile matches."
	};
	if (Boolean(second && second.score >= .7 && best.score - second.score < .12) || best.score < .74) {
		const pool = [best, second].filter((item) => Boolean(item && item.score >= .45));
		const bestPref = preference(formField.label, best.field);
		const suggestions = (pool.length > 1 && bestPref > preference(formField.label, pool[1].field) ? [pool[0]] : pool).map((item) => suggest(item.field));
		return {
			status: "unclear",
			value: "",
			matched: null,
			suggestions,
			note: suggestions.length > 1 ? "Two details could match. Not filled." : `Might be ${suggestions[0]?.label ?? "another detail"}. Not filled.`
		};
	}
	if (!best.field.value.trim()) return {
		status: "missing",
		value: "",
		matched: suggest(best.field),
		suggestions: [],
		note: `${best.field.label} is on the profile, but blank.`
	};
	return {
		status: "filled",
		value: best.field.value,
		matched: suggest(best.field),
		suggestions: [],
		note: `Filled from ${best.field.label}.`
	};
}
function keysFor(label) {
	const normalized = norm(label);
	return normalized ? [normalized] : [];
}
function withFormKey(field, formLabel) {
	const next = new Set(field.keys);
	const extra = norm(formLabel);
	if (extra) next.add(extra);
	return {
		...field,
		keys: [...next]
	};
}
var AMINA_ID = "p-amina";
var FARHAN_ID = "p-farhan";
var SAMPLE_TIME = Date.UTC(2026, 10, 2);
function field(id, label, value, keys) {
	return {
		id,
		label,
		value,
		keys
	};
}
function section(id, title, fields) {
	return {
		id,
		title,
		fields
	};
}
function createSeedProfiles() {
	return [{
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
					"student full name"
				]),
				field("f-amina-pref", "Preferred name", "Amina", ["preferred name", "nickname"]),
				field("f-amina-dob", "Date of birth", "19 June 1994", [
					"date of birth",
					"birth date",
					"dob"
				]),
				field("f-amina-gender", "Gender", "Female", ["gender", "sex"])
			]),
			section("s-amina-contact", "Contact", [
				field("f-amina-email", "Email", "amina.qureshi@example.com", ["email", "email address"]),
				field("f-amina-mobile", "Mobile", "+91 98450 22018", [
					"mobile",
					"mobile number",
					"phone",
					"phone number"
				]),
				field("f-amina-alt", "Alternate phone", "+91 80 4123 9001", ["alternate phone", "alternate mobile"])
			]),
			section("s-amina-addr", "Address", [
				field("f-amina-addr", "Address", "14, 3rd Cross, Cooke Town", [
					"address",
					"home address",
					"current address",
					"address line"
				]),
				field("f-amina-city", "City", "Bengaluru", ["city", "town"]),
				field("f-amina-state", "State", "Karnataka", ["state"]),
				field("f-amina-pin", "PIN code", "560038", [
					"pin",
					"pin code",
					"pincode",
					"postal code"
				])
			]),
			section("s-amina-work", "Work", [
				field("f-amina-role", "Current role", "Product designer", [
					"current role",
					"job title",
					"current job title",
					"designation"
				]),
				field("f-amina-employer", "Employer", "Fieldnote Studio", [
					"employer",
					"company",
					"current employer",
					"organization"
				]),
				field("f-amina-li", "LinkedIn", "linkedin.com/in/aminaqureshi", ["linkedin"])
			]),
			section("s-amina-edu", "Education", [
				field("f-amina-degree", "Highest qualification", "B.Des, Communication Design", [
					"highest qualification",
					"highest degree",
					"degree",
					"qualification"
				]),
				field("f-amina-school", "Institution", "National Institute of Design", [
					"institution",
					"college",
					"university"
				]),
				field("f-amina-year", "Year finished", "2018", ["year finished", "graduation year"])
			]),
			section("s-amina-em", "Emergency", [
				field("f-amina-em-name", "Emergency contact name", "Yusuf Qureshi", ["emergency contact name", "emergency contact"]),
				field("f-amina-em-rel", "Emergency contact relation", "Spouse", ["emergency contact relation", "relation"]),
				field("f-amina-em-phone", "Emergency contact phone", "+91 98450 77821", ["emergency contact phone", "emergency phone"])
			])
		]
	}, {
		id: FARHAN_ID,
		name: "Farhan Qureshi",
		who: "Child",
		updatedAt: SAMPLE_TIME,
		sections: [
			section("s-farhan-id", "Identity", [field("f-farhan-name", "Full name", "Farhan Qureshi", [
				"full name",
				"full legal name",
				"legal name",
				"student full name",
				"student name"
			]), field("f-farhan-dob", "Date of birth", "4 August 2016", [
				"date of birth",
				"birth date",
				"dob"
			])]),
			section("s-farhan-school", "School", [field("f-farhan-class", "Class", "6", [
				"class",
				"standard",
				"grade"
			])]),
			section("s-farhan-em", "Emergency", [
				field("f-farhan-em-name", "Emergency contact name", "Amina Qureshi", ["emergency contact name", "emergency contact"]),
				field("f-farhan-em-rel", "Emergency contact relation", "Mother", ["emergency contact relation", "relation"]),
				field("f-farhan-em-phone", "Emergency contact phone", "+91 98450 22018", ["emergency contact phone", "emergency phone"])
			])
		]
	}];
}
var FORMS = [
	{
		id: "clinic",
		kind: "web",
		kicker: "Victoria Layout Clinic",
		title: "New patient sheet",
		source: "Sample website form",
		fields: [
			{
				id: "c-name",
				label: "Full legal name",
				group: "About you",
				kind: "text"
			},
			{
				id: "c-dob",
				label: "Date of birth",
				group: "About you",
				kind: "text"
			},
			{
				id: "c-sex",
				label: "Sex",
				group: "About you",
				kind: "text"
			},
			{
				id: "c-mobile",
				label: "Mobile number",
				group: "Contact",
				kind: "text"
			},
			{
				id: "c-email",
				label: "Email address",
				group: "Contact",
				kind: "text"
			},
			{
				id: "c-addr",
				label: "Home address",
				group: "Contact",
				kind: "text"
			},
			{
				id: "c-city",
				label: "City",
				group: "Contact",
				kind: "text"
			},
			{
				id: "c-pin",
				label: "PIN code",
				group: "Contact",
				kind: "text"
			},
			{
				id: "c-em-name",
				label: "Emergency contact name",
				group: "Emergency",
				kind: "text"
			},
			{
				id: "c-em-phone",
				label: "Emergency contact phone",
				group: "Emergency",
				kind: "text"
			},
			{
				id: "c-employer",
				label: "Employer",
				group: "Work",
				kind: "text"
			},
			{
				id: "c-allergy",
				label: "Known allergies",
				group: "Clinical",
				kind: "text"
			},
			{
				id: "c-insurance",
				label: "Insurance member ID",
				group: "Clinical",
				kind: "text"
			}
		]
	},
	{
		id: "rental",
		kind: "web",
		kicker: "Indiranagar lets",
		title: "2BHK application",
		source: "Sample website form",
		fields: [
			{
				id: "r-name",
				label: "Full name",
				group: "Applicant",
				kind: "text"
			},
			{
				id: "r-email",
				label: "Email",
				group: "Applicant",
				kind: "text"
			},
			{
				id: "r-phone",
				label: "Mobile number",
				group: "Applicant",
				kind: "text"
			},
			{
				id: "r-addr",
				label: "Current address",
				group: "Applicant",
				kind: "text"
			},
			{
				id: "r-city",
				label: "City",
				group: "Applicant",
				kind: "text"
			},
			{
				id: "r-employer",
				label: "Current employer",
				group: "Work",
				kind: "text"
			},
			{
				id: "r-income",
				label: "Monthly income",
				group: "Work",
				kind: "text"
			},
			{
				id: "r-pan",
				label: "PAN",
				group: "Work",
				kind: "text"
			},
			{
				id: "r-em",
				label: "Emergency contact",
				group: "Emergency",
				kind: "text"
			},
			{
				id: "r-move",
				label: "Move-in date",
				group: "Tenancy",
				kind: "text"
			}
		]
	},
	{
		id: "library",
		kind: "web",
		kicker: "City library",
		title: "Weekend desk application",
		source: "Sample website form",
		fields: [
			{
				id: "j-name",
				label: "Legal name",
				group: "You",
				kind: "text"
			},
			{
				id: "j-email",
				label: "Email address",
				group: "You",
				kind: "text"
			},
			{
				id: "j-phone",
				label: "Phone number",
				group: "You",
				kind: "text"
			},
			{
				id: "j-city",
				label: "City",
				group: "You",
				kind: "text"
			},
			{
				id: "j-degree",
				label: "Highest degree",
				group: "Background",
				kind: "text"
			},
			{
				id: "j-college",
				label: "College or university",
				group: "Background",
				kind: "text"
			},
			{
				id: "j-year",
				label: "Graduation year",
				group: "Background",
				kind: "text"
			},
			{
				id: "j-role",
				label: "Current job title",
				group: "Background",
				kind: "text"
			},
			{
				id: "j-ref",
				label: "Reference phone",
				group: "Background",
				kind: "text"
			},
			{
				id: "j-why",
				label: "Why this role",
				group: "Background",
				kind: "textarea"
			}
		]
	},
	{
		id: "trip",
		kind: "paper",
		kicker: "St. Brigid School, Indiranagar",
		title: "Class trip consent",
		source: "Paper form facsimile",
		fields: [
			{
				id: "t-name",
				label: "Student's full name",
				group: "Student",
				kind: "text"
			},
			{
				id: "t-class",
				label: "Class / standard",
				group: "Student",
				kind: "text"
			},
			{
				id: "t-dob",
				label: "Date of birth",
				group: "Student",
				kind: "text"
			},
			{
				id: "t-school",
				label: "School name",
				group: "Student",
				kind: "text"
			},
			{
				id: "t-parent",
				label: "Parent or guardian name",
				group: "Parent",
				kind: "text"
			},
			{
				id: "t-pmobile",
				label: "Parent mobile",
				group: "Parent",
				kind: "text"
			},
			{
				id: "t-teacher",
				label: "Class teacher",
				group: "School",
				kind: "text"
			},
			{
				id: "t-allergy",
				label: "Allergies",
				group: "School",
				kind: "text"
			}
		]
	}
];
function formById(id) {
	return FORMS.find((form) => form.id === id) ?? FORMS[0];
}
var SAMPLE_RESUME = `Asha Menon
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
var WHO_OPTIONS = [
	"You",
	"Child",
	"Parent",
	"Partner",
	"Colleague",
	"Other"
];
var KEY = "formfill.desk.v1";
function uid(prefix) {
	return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}
function touch(profile) {
	return {
		...profile,
		updatedAt: Date.now()
	};
}
function mapProfile(profiles, id, fn) {
	return profiles.map((profile) => profile.id === id ? touch(fn(profile)) : profile);
}
function blankProfile(name, who) {
	return {
		id: uid("p"),
		name,
		who,
		updatedAt: Date.now(),
		sections: [{
			id: uid("sec"),
			title: "Identity",
			fields: [{
				id: uid("fld"),
				label: "Full name",
				value: name,
				keys: [
					"full name",
					"full legal name",
					"legal name"
				]
			}]
		}]
	};
}
function initialFill(profiles) {
	return {
		formId: FORMS[0].id,
		profileId: profiles.find((profile) => profile.id === "p-amina")?.id ?? profiles[0]?.id ?? null,
		drafts: {}
	};
}
function isProfile(value) {
	if (!value || typeof value !== "object") return false;
	const profile = value;
	return typeof profile.id === "string" && typeof profile.name === "string" && Array.isArray(profile.sections);
}
function readPersisted() {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return null;
		const data = JSON.parse(raw);
		if (!Array.isArray(data.profiles) || !data.profiles.every(isProfile)) return null;
		return {
			profiles: data.profiles,
			onboarded: Boolean(data.onboarded),
			fill: {
				formId: typeof data.fill?.formId === "string" ? data.fill.formId : FORMS[0].id,
				profileId: typeof data.fill?.profileId === "string" ? data.fill.profileId : null
			}
		};
	} catch {
		return null;
	}
}
function writePersisted(state) {
	const payload = {
		profiles: state.profiles,
		onboarded: state.onboarded,
		fill: {
			formId: state.fill.formId,
			profileId: state.fill.profileId
		}
	};
	localStorage.setItem(KEY, JSON.stringify(payload));
}
function mergeProposals(profile, proposals) {
	const sections = profile.sections.map((section) => ({
		...section,
		fields: section.fields.map((field) => ({ ...field }))
	}));
	for (const item of proposals) {
		if (!item.accepted || !item.value.trim()) continue;
		let section = sections.find((entry) => norm(entry.title) === norm(item.section));
		if (!section) {
			section = {
				id: uid("sec"),
				title: item.section.trim() || "General",
				fields: []
			};
			sections.push(section);
		}
		const existing = section.fields.find((field) => norm(field.label) === norm(item.label));
		if (existing) {
			existing.value = item.value.trim();
			existing.keys = [.../* @__PURE__ */ new Set([...existing.keys, ...keysFor(item.label)])];
		} else section.fields.push({
			id: uid("fld"),
			label: item.label.trim(),
			value: item.value.trim(),
			keys: keysFor(item.label)
		});
	}
	return touch({
		...profile,
		sections
	});
}
var useVault = create((set, get) => ({
	hydrated: false,
	onboarded: false,
	profiles: createSeedProfiles(),
	screen: { name: "people" },
	fill: initialFill(createSeedProfiles()),
	hydrate: () => {
		if (get().hydrated) return;
		const saved = readPersisted();
		if (!saved) {
			set({ hydrated: true });
			return;
		}
		const profileId = saved.profiles.some((profile) => profile.id === saved.fill.profileId) ? saved.fill.profileId : saved.profiles[0]?.id ?? null;
		set({
			hydrated: true,
			onboarded: saved.onboarded,
			profiles: saved.profiles,
			fill: {
				formId: saved.fill.formId,
				profileId,
				drafts: {}
			}
		});
	},
	dismissOnboarding: () => set({ onboarded: true }),
	go: (screen) => set({ screen }),
	addProfile: (name, who) => {
		const profile = blankProfile(name.trim(), who.trim() || "Other");
		set((state) => ({
			profiles: [...state.profiles, profile],
			screen: {
				name: "person",
				profileId: profile.id
			}
		}));
		return profile.id;
	},
	removeProfile: (id) => set((state) => {
		const profiles = state.profiles.filter((profile) => profile.id !== id);
		const profileId = state.fill.profileId === id ? profiles[0]?.id ?? null : state.fill.profileId;
		return {
			profiles,
			screen: state.screen.name === "person" && state.screen.profileId === id ? { name: "people" } : state.screen,
			fill: {
				...state.fill,
				profileId,
				drafts: {}
			}
		};
	}),
	updateProfileMeta: (id, patch) => set((state) => ({ profiles: mapProfile(state.profiles, id, (profile) => ({
		...profile,
		name: patch.name?.trim() || profile.name,
		who: patch.who?.trim() || profile.who
	})) })),
	addSection: (profileId, title) => set((state) => ({ profiles: mapProfile(state.profiles, profileId, (profile) => ({
		...profile,
		sections: [...profile.sections, {
			id: uid("sec"),
			title: title.trim() || "Untitled",
			fields: []
		}]
	})) })),
	renameSection: (profileId, sectionId, title) => set((state) => ({ profiles: mapProfile(state.profiles, profileId, (profile) => ({
		...profile,
		sections: profile.sections.map((section) => section.id === sectionId ? {
			...section,
			title: title.trim() || section.title
		} : section)
	})) })),
	removeSection: (profileId, sectionId) => set((state) => ({ profiles: mapProfile(state.profiles, profileId, (profile) => ({
		...profile,
		sections: profile.sections.filter((section) => section.id !== sectionId)
	})) })),
	addField: (profileId, sectionId, label, value) => set((state) => ({ profiles: mapProfile(state.profiles, profileId, (profile) => ({
		...profile,
		sections: profile.sections.map((section) => section.id === sectionId ? {
			...section,
			fields: [...section.fields, {
				id: uid("fld"),
				label: label.trim(),
				value: value.trim(),
				keys: keysFor(label)
			}]
		} : section)
	})) })),
	updateField: (profileId, sectionId, fieldId, patch) => set((state) => ({ profiles: mapProfile(state.profiles, profileId, (profile) => ({
		...profile,
		sections: profile.sections.map((section) => section.id === sectionId ? {
			...section,
			fields: section.fields.map((field) => {
				if (field.id !== fieldId) return field;
				const label = patch.label !== void 0 ? patch.label : field.label;
				const value = patch.value !== void 0 ? patch.value : field.value;
				const keys = patch.label !== void 0 && norm(patch.label) !== norm(field.label) ? [.../* @__PURE__ */ new Set([...field.keys, ...keysFor(label)])] : field.keys;
				return {
					...field,
					label,
					value,
					keys
				};
			})
		} : section)
	})) })),
	removeField: (profileId, sectionId, fieldId) => set((state) => ({ profiles: mapProfile(state.profiles, profileId, (profile) => ({
		...profile,
		sections: profile.sections.map((section) => section.id === sectionId ? {
			...section,
			fields: section.fields.filter((field) => field.id !== fieldId)
		} : section)
	})) })),
	setFillForm: (formId) => set((state) => ({ fill: {
		...state.fill,
		formId,
		drafts: {}
	} })),
	setFillProfile: (profileId) => set((state) => ({ fill: {
		...state.fill,
		profileId,
		drafts: {}
	} })),
	setDraft: (fieldId, value) => set((state) => ({ fill: {
		...state.fill,
		drafts: {
			...state.fill.drafts,
			[fieldId]: value
		}
	} })),
	saveAnswer: ({ profileId, sectionTitle, label, value, formLabel, fieldId, sectionId }) => set((state) => ({ profiles: mapProfile(state.profiles, profileId, (profile) => {
		const sections = profile.sections.map((section) => ({
			...section,
			fields: section.fields.map((field) => ({ ...field }))
		}));
		const cleaned = value.trim();
		if (fieldId) {
			const field = sections.find((entry) => entry.fields.some((field) => field.id === fieldId))?.fields.find((entry) => entry.id === fieldId);
			if (field) {
				field.value = cleaned;
				field.keys = withFormKey(field, formLabel).keys;
				return {
					...profile,
					sections
				};
			}
		}
		let section = sectionId ? sections.find((entry) => entry.id === sectionId) : void 0;
		if (!section) section = sections.find((entry) => norm(entry.title) === norm(sectionTitle));
		if (!section) {
			section = {
				id: uid("sec"),
				title: sectionTitle.trim() || "General",
				fields: []
			};
			sections.push(section);
		}
		section.fields.push({
			id: uid("fld"),
			label: label.trim() || formLabel,
			value: cleaned,
			keys: [.../* @__PURE__ */ new Set([...keysFor(label || formLabel), ...keysFor(formLabel)])]
		});
		return {
			...profile,
			sections
		};
	}) })),
	importProposals: ({ profileId, name, who, proposals }) => {
		if (profileId) {
			set((state) => ({
				profiles: state.profiles.map((profile) => profile.id === profileId ? mergeProposals(profile, proposals) : profile),
				screen: {
					name: "person",
					profileId
				}
			}));
			return profileId;
		}
		const base = blankProfile(name.trim() || "Imported person", who.trim() || "Other");
		const named = base.sections[0]?.fields[0];
		if (named && name.trim()) named.value = name.trim();
		const profile = mergeProposals(base, proposals);
		set((state) => ({
			profiles: [...state.profiles, profile],
			screen: {
				name: "person",
				profileId: profile.id
			},
			fill: {
				...state.fill,
				profileId: profile.id
			}
		}));
		return profile.id;
	},
	resetSamples: () => {
		const profiles = createSeedProfiles();
		set({
			profiles,
			onboarded: true,
			screen: { name: "people" },
			fill: initialFill(profiles)
		});
	}
}));
if (typeof window !== "undefined") useVault.subscribe((state) => {
	if (!state.hydrated) return;
	writePersisted(state);
});
function profileStats(profile) {
	const fields = profile.sections.flatMap((section) => section.fields);
	const filled = fields.filter((field) => field.value.trim()).length;
	return {
		sections: profile.sections.length,
		fields: fields.length,
		filled
	};
}
function initials(name) {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (!parts.length) return "?";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}
function formatWhen(timestamp) {
	return new Intl.DateTimeFormat("en-IN", {
		day: "numeric",
		month: "short",
		year: "numeric"
	}).format(timestamp);
}
function defaultSectionFor(group) {
	if (/emergency|parent/i.test(group)) return "Emergency";
	if (/work|job|background/i.test(group)) return "Work";
	if (/school|education/i.test(group)) return "Education";
	if (/address|contact/i.test(group)) return "Contact";
	if (/clinic|health|clinical/i.test(group)) return "Health";
	if (/about|you|applicant|student|identity/i.test(group)) return "Identity";
	return "General";
}
function cn(...parts) {
	return twMerge(parts.filter(Boolean).join(" "));
}
function Button({ tone = "stamp", className, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium transition-transform duration-150 ease-out active:not-disabled:scale-[0.96] disabled:opacity-40", tone === "stamp" && "bg-stamp text-cream", tone === "paper" && "bg-cream text-ink shadow-sheet", tone === "quiet" && "bg-cream-2 text-ink", tone === "ghost" && "bg-transparent text-cream", className),
		...props
	});
}
function IconButton({ className, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: cn("inline-flex size-11 items-center justify-center rounded-full text-cream transition-transform duration-150 ease-out active:not-disabled:scale-[0.96]", className),
		...props
	});
}
function Wordmark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-2 font-serif text-2xl leading-none text-cream",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 32 32",
			className: "size-7",
			"aria-hidden": "true",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "6",
					y: "6",
					width: "16",
					height: "18",
					rx: "2",
					fill: "var(--color-cream-2)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "10",
					y: "9",
					width: "16",
					height: "18",
					rx: "2",
					fill: "var(--color-cream)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "10",
					y: "9",
					width: "6",
					height: "6",
					rx: "1",
					fill: "var(--color-stamp)"
				})
			]
		}), "FormFill"]
	});
}
function Sheet({ className, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: cn("rounded-2xl bg-cream text-ink shadow-sheet", className),
		children
	});
}
function PaperInput({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("min-h-11 w-full rounded-lg border border-rule bg-cream px-3 text-base text-ink outline-none placeholder:text-mute/70 focus-visible:border-stamp", className),
		...props
	});
}
function PaperArea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("min-h-24 w-full rounded-lg border border-rule bg-cream px-3 py-2 text-base text-ink outline-none placeholder:text-mute/70 focus-visible:border-stamp", className),
		...props
	});
}
function AdSlot() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "rounded-2xl border border-dashed border-edge px-4 py-3",
		"aria-label": "Advertisement",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-widest text-cream/50 uppercase",
				children: "Ad"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-serif text-xl text-cream",
				children: "Carbon & Rule"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-cream/70",
				children: "Carbonless form sets, printed in Bengaluru. This ad is the same for everyone. It never reads a profile."
			})
		]
	});
}
function rowsFor(profile, template) {
	const flat = profile ? flatten(profile) : [];
	return template.fields.map((field) => {
		if (!profile) return {
			field,
			status: "missing",
			baseline: "",
			note: "Choose a person first.",
			matched: null,
			suggestions: []
		};
		const resolution = resolveField(field, flat);
		return {
			field,
			status: resolution.status,
			baseline: resolution.value,
			note: resolution.note,
			matched: resolution.matched,
			suggestions: resolution.suggestions
		};
	});
}
function FillScreen() {
	const profiles = useVault((s) => s.profiles);
	const formId = useVault((s) => s.fill.formId);
	const profileId = useVault((s) => s.fill.profileId);
	const drafts = useVault((s) => s.fill.drafts);
	const setFillForm = useVault((s) => s.setFillForm);
	const setFillProfile = useVault((s) => s.setFillProfile);
	const template = formById(formId);
	const profile = profiles.find((item) => item.id === profileId) ?? null;
	const rows = (0, import_react.useMemo)(() => rowsFor(profile, template), [profile, template]);
	const farhan = profiles.some((item) => item.id === FARHAN_ID);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "lg:grid lg:grid-cols-3 lg:items-start lg:gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:col-span-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-2 overflow-x-auto pb-3",
						children: FORMS.map((form) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							"aria-pressed": form.id === template.id,
							onClick: () => setFillForm(form.id),
							className: `min-h-11 shrink-0 rounded-full px-4 text-sm ${form.id === template.id ? "bg-cream text-ink" : "bg-desk-2 text-cream"}`,
							children: [form.kind === "paper" ? "Paper · " : "", form.title]
						}, form.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-cream/70",
						children: template.kind === "paper" ? "A picture of a paper form. Filling a real PDF or Word file is not in this preview." : "A sample website form. Putting this on a live site is still to build."
					}),
					farhan && !(template.id === "trip" && profileId === "p-farhan") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "mt-2 min-h-11 text-left text-sm text-cream underline decoration-edge underline-offset-4",
						onClick: () => {
							setFillForm("trip");
							setFillProfile("p-farhan");
						},
						children: "See unsure matches — school trip, as Farhan"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormPaper, {
						template,
						profile,
						rows,
						drafts
					}, `${template.id}:${profile?.id ?? "none"}`)
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hidden lg:sticky lg:top-24 lg:block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Extension, {
					profile,
					profiles,
					rows,
					drafts
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileExtension, {
				profile,
				profiles,
				rows,
				drafts
			})
		]
	});
}
function FormPaper({ template, profile, rows, drafts }) {
	const groups = [];
	for (const row of rows) {
		const last = groups[groups.length - 1];
		if (!last || last.name !== row.field.group) groups.push({
			name: row.field.group,
			rows: [row]
		});
		else last.rows.push(row);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "mt-4 rounded-2xl bg-cream text-ink shadow-sheet",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "border-b border-rule px-5 py-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-widest text-mute uppercase",
					children: template.kicker
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-serif text-3xl",
					children: template.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-mute",
					children: template.source
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
			className: "px-5 py-4",
			autoComplete: "off",
			onSubmit: (event) => event.preventDefault(),
			children: groups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
				className: "mt-4 first:mt-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
					className: "text-xs font-medium tracking-widest text-mute uppercase",
					children: group.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 flex flex-col gap-4",
					children: group.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldRow, {
						row,
						profile,
						draft: drafts[row.field.id]
					}, row.field.id))
				})]
			}, group.name))
		})]
	});
}
function FieldRow({ row, profile, draft }) {
	const setDraft = useVault((s) => s.setDraft);
	const saveAnswer = useVault((s) => s.saveAnswer);
	const [picked, setPicked] = (0, import_react.useState)(null);
	const [sectionTitle, setSectionTitle] = (0, import_react.useState)(defaultSectionFor(row.field.group));
	const [label, setLabel] = (0, import_react.useState)(row.field.label);
	const [skipped, setSkipped] = (0, import_react.useState)(null);
	const [saved, setSaved] = (0, import_react.useState)("");
	const shown = draft !== void 0 ? draft : row.baseline;
	const dirty = draft !== void 0 && draft !== row.baseline;
	const answered = shown.trim().length > 0;
	const usingStored = picked !== null && shown === picked.value ? picked : row.matched && shown === row.matched.value ? row.matched : null;
	const prompt = Boolean(profile) && dirty && answered && skipped !== shown && !usingStored;
	const bar = answered ? "bg-stamp" : row.status === "unclear" ? "bg-ink" : "bg-clay";
	const flag = answered ? row.status === "filled" && !dirty ? "Filled" : "Typed" : row.status === "unclear" ? "Check" : "Missing";
	const sections = profile?.sections.map((section) => section.title) ?? [];
	const sectionOptions = [.../* @__PURE__ */ new Set([sectionTitle, ...sections])];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative pl-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `absolute top-1 bottom-1 left-0 w-1 rounded-full ${bar}`,
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				className: "text-sm font-medium",
				htmlFor: row.field.id,
				children: row.field.label
			}),
			row.field.kind === "textarea" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaperArea, {
				id: row.field.id,
				className: "mt-1",
				autoComplete: "off",
				value: shown,
				onChange: (event) => {
					setDraft(row.field.id, event.target.value);
					setSaved("");
				}
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaperInput, {
				id: row.field.id,
				className: "mt-1",
				autoComplete: "off",
				value: shown,
				onChange: (event) => {
					setDraft(row.field.id, event.target.value);
					setSaved("");
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: `mt-1 text-sm ${!answered && row.status === "missing" ? "text-clay-ink" : "text-mute"}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-medium text-ink",
					children: [flag, ". "]
				}), dirty && answered ? "Typed on this form." : row.note]
			}),
			!answered && row.suggestions.map((suggestion) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "mt-2 flex min-h-11 w-full items-center justify-between gap-3 rounded-xl bg-cream-2 px-3 text-left text-sm",
				onClick: () => {
					setPicked(suggestion);
					setDraft(row.field.id, suggestion.value);
					setSaved("");
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block font-medium",
					children: suggestion.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "block text-mute",
					children: [
						suggestion.sectionTitle,
						" · ",
						suggestion.value || "Blank"
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "shrink-0 font-medium text-stamp",
					children: "Use"
				})]
			}, suggestion.fieldId)),
			prompt && profile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 rounded-xl bg-cream-2 p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: picked || row.matched ? `Update ${profile.name}?` : `Save this on ${profile.name}?`
					}),
					!(picked || row.matched) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-col gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-xs tracking-widest text-mute uppercase",
								htmlFor: `${row.field.id}-section`,
								children: "Section"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								id: `${row.field.id}-section`,
								className: "min-h-11 rounded-lg border border-rule bg-cream px-3 text-base",
								value: sectionTitle,
								onChange: (event) => setSectionTitle(event.target.value),
								children: sectionOptions.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: option }, option))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaperInput, {
								"aria-label": "Field name to save",
								value: label,
								onChange: (event) => setLabel(event.target.value)
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => {
								const target = picked ?? row.matched;
								saveAnswer({
									profileId: profile.id,
									sectionTitle,
									label: target?.label ?? label,
									value: shown,
									formLabel: row.field.label,
									fieldId: target?.fieldId,
									sectionId: target?.sectionId
								});
								setSaved(target ? `Updated ${target.label}.` : `Saved under ${sectionTitle}.`);
							},
							children: picked || row.matched ? "Update profile" : "Save to profile"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							tone: "quiet",
							onClick: () => setSkipped(shown),
							children: "Not now"
						})]
					})
				]
			}),
			saved && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-ink",
				children: saved
			})
		]
	});
}
function counts(rows, drafts) {
	let filled = 0;
	let check = 0;
	let missing = 0;
	for (const row of rows) if ((drafts[row.field.id] !== void 0 ? drafts[row.field.id] : row.baseline).trim()) filled += 1;
	else if (row.status === "unclear") check += 1;
	else missing += 1;
	return {
		filled,
		check,
		missing
	};
}
function Extension({ profile, profiles, rows, drafts }) {
	const setFillProfile = useVault((s) => s.setFillProfile);
	const tally = counts(rows, drafts);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3 rounded-2xl bg-desk-2 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-widest text-cream/50 uppercase",
				children: "Extension"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-serif text-2xl text-cream",
				children: "Who is this for?"
			})] }),
			profiles.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-cream/70",
				children: "Add a person before filling."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-2",
				children: profiles.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					"aria-pressed": item.id === profile?.id,
					onClick: () => setFillProfile(item.id),
					className: `min-h-11 rounded-xl px-3 text-left text-sm ${item.id === profile?.id ? "bg-cream text-ink" : "bg-desk text-cream"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-medium",
						children: item.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `block ${item.id === profile?.id ? "text-mute" : "text-cream/60"}`,
						children: item.who
					})]
				}, item.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "grid grid-cols-3 gap-2 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Count, {
						label: "Filled",
						value: tally.filled
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Count, {
						label: "Check",
						value: tally.check
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Count, {
						label: "Missing",
						value: tally.missing
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-cream/70",
				children: "Matching answers go in. Anything missing or unsure stays empty until you choose."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdSlot, {})
		]
	});
}
function Count({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-desk px-2 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-xs text-cream/60",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "font-serif text-2xl text-cream tabular-nums",
			children: value
		})]
	});
}
function MobileExtension(props) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const tally = counts(props.rows, props.drafts);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "ext-dock fixed inset-x-0 z-30 px-4 lg:hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => setOpen(true),
			className: "flex min-h-12 w-full items-center justify-between rounded-full bg-cream px-4 text-ink shadow-sheet",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: props.profile ? props.profile.name : "Choose a person"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-sm text-mute tabular-nums",
				children: [
					tally.filled,
					" filled · ",
					tally.check,
					" check"
				]
			})]
		})
	}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-40 lg:hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "absolute inset-0 bg-desk/70",
			"aria-label": "Close extension",
			onClick: () => setOpen(false)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "ext-sheet sheet-cap absolute inset-x-0 overflow-y-auto rounded-t-2xl",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Extension, { ...props })
		})]
	})] });
}
var STEPS = [
	{
		n: "01",
		title: "Keep a person",
		body: "You, a child, a parent — anyone you fill forms for.",
		state: "Here",
		action: "people"
	},
	{
		n: "02",
		title: "Name your own sections",
		body: "Identity, school, health, whatever the forms actually ask.",
		state: "Here",
		action: "person"
	},
	{
		n: "03",
		title: "Import, then check",
		body: "Paste or a text file. Sure lines and guesses stay separate until you save.",
		state: "Partial",
		action: "import"
	},
	{
		n: "04",
		title: "Choose who the form is for",
		body: "The extension asks for a person before it writes anything.",
		state: "Partial",
		action: "fill"
	},
	{
		n: "05",
		title: "Fill matches. Flag the rest.",
		body: "A confident answer goes in. A guess or a gap stays empty and marked.",
		state: "Here",
		action: "trip"
	},
	{
		n: "06",
		title: "Save a new answer back",
		body: "Type something the profile doesn't have. FormFill can offer to keep it.",
		state: "Here",
		action: "fill"
	},
	{
		n: "07",
		title: "One copy, app and extension",
		body: "The phone app and the browser extension are meant to share it, including offline.",
		state: "Not built",
		action: "sync"
	},
	{
		n: "08",
		title: "Free, with ads that stay out",
		body: "The direction is free with ads. Profile details are not for targeting.",
		state: "Here",
		action: "sync"
	}
];
function FlowScreen() {
	const go = useVault((s) => s.go);
	const profiles = useVault((s) => s.profiles);
	const setFillForm = useVault((s) => s.setFillForm);
	const setFillProfile = useVault((s) => s.setFillProfile);
	const open = (action) => {
		if (action === "people") go({ name: "people" });
		if (action === "person") {
			const id = profiles[0]?.id;
			if (id) go({
				name: "person",
				profileId: id
			});
			else go({ name: "people" });
		}
		if (action === "import") go({
			name: "import",
			profileId: null
		});
		if (action === "fill") go({ name: "fill" });
		if (action === "trip") {
			setFillForm("trip");
			if (profiles.some((profile) => profile.id === "p-farhan")) setFillProfile(FARHAN_ID);
			go({ name: "fill" });
		}
		if (action === "sync") go({ name: "sync" });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex w-full max-w-xl flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-3xl text-cream",
				children: "The flow"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-cream/70",
				children: "What this preview can do, and what is still only a direction. Open any step."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "flex flex-col gap-3",
				children: STEPS.map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => open(step.action),
					className: "w-full text-left",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
						className: "flex gap-3 p-4 transition-transform duration-150 ease-out active:scale-[0.96]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-serif text-xl text-stamp tabular-nums",
							children: step.n
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-serif text-xl",
									children: step.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepState, { state: step.state })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 block text-sm text-mute",
								children: step.body
							})]
						})]
					})
				}) }, step.n))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
				className: "p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-serif text-xl",
					children: "Still outside this preview"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-2 flex flex-col gap-2 text-sm text-mute",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "A real browser extension on live websites." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Reading PDF and Word forms, not just a paper facsimile." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "An encrypted copy, and Google sync between devices." })
					]
				})]
			})
		]
	});
}
function StepState({ state }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `rounded-full px-2 py-0.5 text-xs font-medium ${state === "Not built" ? "bg-cream-2 text-clay-ink" : state === "Partial" ? "bg-cream-2 text-ink" : "bg-stamp text-cream"}`,
		children: state
	});
}
var LABELED = [
	{
		test: /^(full name|name)$/i,
		label: "Full name",
		section: "Identity"
	},
	{
		test: /^(date of birth|dob|d\.o\.b\.)$/i,
		label: "Date of birth",
		section: "Identity"
	},
	{
		test: /^(gender|sex)$/i,
		label: "Gender",
		section: "Identity"
	},
	{
		test: /^(email|e-mail|email address)$/i,
		label: "Email",
		section: "Contact"
	},
	{
		test: /^(mobile|phone|mobile number|phone number|cell)$/i,
		label: "Mobile",
		section: "Contact"
	},
	{
		test: /^(address|home address|current address)$/i,
		label: "Address",
		section: "Address"
	},
	{
		test: /^(city|town)$/i,
		label: "City",
		section: "Address"
	},
	{
		test: /^(state)$/i,
		label: "State",
		section: "Address"
	},
	{
		test: /^(pin|pin code|pincode|zip|postal code)$/i,
		label: "PIN code",
		section: "Address"
	},
	{
		test: /^(linkedin|linked in)$/i,
		label: "LinkedIn",
		section: "Work"
	},
	{
		test: /^(github)$/i,
		label: "GitHub",
		section: "Work"
	},
	{
		test: /^(employer|company|organization|organisation)$/i,
		label: "Employer",
		section: "Work"
	},
	{
		test: /^(role|title|current role|job title|designation)$/i,
		label: "Current role",
		section: "Work"
	},
	{
		test: /^(nationality)$/i,
		label: "Nationality",
		section: "Identity"
	}
];
var SECTION_HEADERS = {
	experience: {
		label: "Experience",
		section: "Work"
	},
	"work experience": {
		label: "Experience",
		section: "Work"
	},
	education: {
		label: "Education",
		section: "Education"
	},
	skills: {
		label: "Skills",
		section: "Skills"
	},
	summary: {
		label: "Summary",
		section: "Identity"
	},
	projects: {
		label: "Projects",
		section: "Work"
	}
};
var EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
var PHONE_RE = /(?:\+\d{1,3}[\s-]?)?(?:\d[\s()-]?){9,}\d/;
function proposal(partial, index) {
	return {
		id: `proposal-${index}-${partial.label.toLowerCase().replace(/[^a-z]+/g, "-")}`,
		accepted: partial.accepted ?? partial.confidence === "sure",
		label: partial.label,
		value: partial.value.trim(),
		section: partial.section,
		confidence: partial.confidence,
		source: partial.source
	};
}
function looksLikeName(line) {
	if (line.length > 40 || /@|\d/.test(line)) return false;
	const words = line.split(/\s+/).filter(Boolean);
	return words.length >= 2 && words.length <= 4;
}
function extractDocument(text) {
	const lines = text.split(/\r?\n/).map((line) => line.trim());
	const used = /* @__PURE__ */ new Set();
	const found = [];
	let count = 0;
	const push = (item) => {
		if (!item.value.trim()) return;
		if (found.some((existing) => existing.label === item.label)) return;
		found.push(proposal(item, count));
		count += 1;
	};
	lines.forEach((line, index) => {
		if (!line) return;
		const split = line.match(/^([^:]{2,40}):\s*(.+)$/);
		if (!split) return;
		const rule = LABELED.find((entry) => entry.test.test(split[1].trim()));
		if (!rule) return;
		used.add(index);
		push({
			label: rule.label,
			value: split[2].trim(),
			section: rule.section,
			confidence: "sure",
			source: line
		});
	});
	if (!found.some((item) => item.label === "Email")) {
		const email = text.match(EMAIL_RE);
		if (email) push({
			label: "Email",
			value: email[0],
			section: "Contact",
			confidence: "sure",
			source: email[0]
		});
	}
	if (!found.some((item) => item.label === "Mobile")) {
		const phone = text.match(PHONE_RE);
		if (phone) push({
			label: "Mobile",
			value: phone[0].trim(),
			section: "Contact",
			confidence: "check",
			source: phone[0].trim()
		});
	}
	const headerIndexes = [];
	lines.forEach((line, index) => {
		const key = line.toLowerCase().replace(/[:\s]+$/g, "");
		if (SECTION_HEADERS[key]) headerIndexes.push({
			index,
			key
		});
	});
	headerIndexes.forEach((header, position) => {
		const end = headerIndexes[position + 1]?.index ?? lines.length;
		const body = lines.slice(header.index + 1, end).map((line) => line.trim()).filter(Boolean);
		for (let index = header.index; index < end; index += 1) used.add(index);
		const mapped = SECTION_HEADERS[header.key];
		if (!mapped || !body.length) return;
		push({
			label: mapped.label,
			value: body.join("\n"),
			section: mapped.section,
			confidence: "check",
			source: lines[header.index] ?? mapped.label
		});
	});
	if (!found.some((item) => item.label === "Full name")) {
		const first = lines.findIndex((line) => line.length > 0);
		if (first >= 0 && looksLikeName(lines[first])) {
			used.add(first);
			push({
				label: "Full name",
				value: lines[first],
				section: "Identity",
				confidence: "check",
				source: "First line of the document"
			});
		}
	} else {
		const first = lines.findIndex((line) => line.length > 0);
		const named = found.find((item) => item.label === "Full name");
		if (first >= 0 && named && lines[first].toLowerCase() === named.value.toLowerCase()) used.add(first);
	}
	return {
		proposals: found,
		leftovers: lines.map((line, index) => ({
			line,
			index
		})).filter(({ line, index }) => line && !used.has(index)).map(({ line }) => line).filter((line) => line.length > 2).slice(0, 6),
		suggestedName: found.find((item) => item.label === "Full name")?.value ?? ""
	};
}
function readUploadedFile(file) {
	const name = file.name.toLowerCase();
	if (name.endsWith(".txt") || name.endsWith(".md") || name.endsWith(".csv") || file.type.startsWith("text/")) return file.text().then((text) => ({ text }));
	if (name.endsWith(".pdf") || name.endsWith(".doc") || name.endsWith(".docx")) return Promise.resolve({ error: "PDF and Word reading is not in this preview. Paste the text, or upload a .txt file." });
	return Promise.resolve({ error: "This preview reads pasted text and .txt files." });
}
function ImportScreen({ profileId }) {
	const profile = useVault((s) => s.profiles.find((item) => item.id === profileId) ?? null);
	const importProposals = useVault((s) => s.importProposals);
	const [text, setText] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [fileName, setFileName] = (0, import_react.useState)("");
	const [proposals, setProposals] = (0, import_react.useState)(null);
	const [leftovers, setLeftovers] = (0, import_react.useState)([]);
	const [name, setName] = (0, import_react.useState)("");
	const [who, setWho] = (0, import_react.useState)("Other");
	const load = (raw, sourceLabel) => {
		const result = extractDocument(raw);
		if (!result.proposals.length) {
			setError(`Nothing recognizable in ${sourceLabel}. Try lines like “Email: you@example.com”.`);
			setProposals(null);
			return;
		}
		setError("");
		setProposals(result.proposals);
		setLeftovers(result.leftovers);
		setName(result.suggestedName);
	};
	const onFile = async (file) => {
		if (!file) return;
		setFileName(file.name);
		const result = await readUploadedFile(file);
		if ("error" in result) {
			setError(result.error);
			setProposals(null);
			return;
		}
		load(result.text, file.name);
	};
	const accepted = (0, import_react.useMemo)(() => proposals?.filter((item) => item.accepted).length ?? 0, [proposals]);
	if (!proposals) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex w-full max-w-xl flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-3xl text-cream",
				children: "Import"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-cream/70",
				children: profile ? `Pull details into ${profile.name}. You check them before anything is saved.` : "Paste a resume or note. You check every line before it becomes a profile."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
				className: "p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "text-xs font-medium tracking-widest text-mute uppercase",
						htmlFor: "import-text",
						children: "Paste text"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaperArea, {
						id: "import-text",
						className: "mt-2",
						value: text,
						placeholder: "Asha Menon\nEmail: asha@example.com\nCity: Bengaluru",
						onChange: (event) => setText(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: !text.trim(),
							onClick: () => load(text, "the paste"),
							children: "Read this"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							tone: "quiet",
							onClick: () => load(SAMPLE_RESUME, "the sample resume"),
							children: "Use the sample resume"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
				className: "p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-widest text-mute uppercase",
						children: "Or a file"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-3 flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-rule px-4 text-center text-sm text-mute",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: ".txt, .md, or .csv" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 text-xs",
								children: "PDF and Word are refused until a reader is built."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "sr-only",
								type: "file",
								accept: ".txt,.md,.csv,.pdf,.doc,.docx,text/plain",
								onChange: (event) => void onFile(event.target.files?.[0])
							})
						]
					}),
					fileName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-mute",
						children: fileName
					})
				]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-xl bg-desk-2 px-4 py-3 text-sm text-cream",
				role: "status",
				children: error
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex w-full max-w-xl flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-3xl text-cream",
				children: "Check this"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-cream/70",
				children: [accepted, " selected. Sure lines are on by default. Check lines need a look. Nothing is saved yet."]
			})] }),
			!profile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
				className: "p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "text-xs font-medium tracking-widest text-mute uppercase",
						htmlFor: "import-name",
						children: "Save as"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaperInput, {
						id: "import-name",
						className: "mt-2",
						value: name,
						onChange: (event) => setName(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: WHO_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": who === option,
							onClick: () => setWho(option),
							className: `min-h-11 rounded-full px-3 text-sm ${who === option ? "bg-stamp text-cream" : "bg-cream-2 text-ink"}`,
							children: option
						}, option))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-3",
				children: proposals.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
					className: "p-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": item.accepted,
							"aria-label": item.accepted ? `Skip ${item.label}` : `Keep ${item.label}`,
							onClick: () => setProposals((current) => current.map((entry) => entry.id === item.id ? {
								...entry,
								accepted: !entry.accepted
							} : entry)),
							className: `mt-1 size-11 shrink-0 rounded-xl border ${item.accepted ? "border-stamp bg-stamp text-cream" : "border-rule bg-cream text-mute"}`,
							children: item.accepted ? "On" : "Off"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs font-medium tracking-widest text-mute uppercase",
										children: [
											item.section,
											" · ",
											item.label
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-full bg-cream-2 px-2 py-0.5 text-xs text-ink",
										children: item.confidence === "sure" ? "Sure" : "Check"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaperArea, {
									className: "mt-2 min-h-11",
									value: item.value,
									"aria-label": item.label,
									onChange: (event) => setProposals((current) => current.map((entry) => entry.id === item.id ? {
										...entry,
										value: event.target.value
									} : entry))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-xs text-mute",
									children: ["From: ", item.source]
								})
							]
						})]
					})
				}) }, item.id))
			}),
			leftovers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
				className: "p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-xl",
						children: "Left out"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-mute",
						children: "These lines were not mapped. They are not saved."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 flex flex-col gap-2 text-sm",
						children: leftovers.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "border-t border-rule pt-2 first:border-t-0 first:pt-0",
							children: line
						}, line))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: accepted === 0 || !profile && !name.trim(),
					onClick: () => importProposals({
						profileId: profile?.id ?? null,
						name,
						who,
						proposals
					}),
					children: profile ? `Add to ${profile.name}` : "Save as a new person"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					tone: "paper",
					onClick: () => setProposals(null),
					children: "Start over"
				})]
			})
		]
	});
}
function PeopleScreen() {
	const profiles = useVault((s) => s.profiles);
	const onboarded = useVault((s) => s.onboarded);
	const dismiss = useVault((s) => s.dismissOnboarding);
	const go = useVault((s) => s.go);
	const addProfile = useVault((s) => s.addProfile);
	const [adding, setAdding] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)("");
	const [who, setWho] = (0, import_react.useState)("You");
	const [customWho, setCustomWho] = (0, import_react.useState)("");
	const submit = () => {
		const chosen = who === "Other" ? customWho.trim() || "Other" : who;
		if (!name.trim()) return;
		addProfile(name, chosen);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex w-full max-w-xl flex-col gap-4",
		children: [
			!onboarded && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
				className: "rise p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-widest text-mute uppercase",
						children: "Design preview"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 font-serif text-3xl",
						children: "Answers, kept once."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-mute",
						children: "Walk the sample people, check an import, then fill a sample form. Live websites, PDF and Word files, and encrypted Google sync are still to build."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-4",
						onClick: dismiss,
						children: "Look around"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-serif text-3xl text-cream",
					children: "People"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-cream/70",
					children: "Anyone you fill forms for, including yourself."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					tone: "paper",
					onClick: () => setAdding((open) => !open),
					children: "Add"
				})]
			}),
			adding && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
				className: "p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "text-xs font-medium tracking-widest text-mute uppercase",
						htmlFor: "new-name",
						children: "Name"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaperInput, {
						id: "new-name",
						className: "mt-2",
						value: name,
						placeholder: "Their name",
						onChange: (event) => setName(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs font-medium tracking-widest text-mute uppercase",
						children: "Who"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex flex-wrap gap-2",
						children: WHO_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": who === option,
							onClick: () => setWho(option),
							className: `min-h-11 rounded-full px-3 text-sm ${who === option ? "bg-stamp text-cream" : "bg-cream-2 text-ink"}`,
							children: option
						}, option))
					}),
					who === "Other" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaperInput, {
						className: "mt-3",
						value: customWho,
						placeholder: "Neighbour, client…",
						onChange: (event) => setCustomWho(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: submit,
							disabled: !name.trim(),
							children: "Create profile"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							tone: "quiet",
							onClick: () => setAdding(false),
							children: "Cancel"
						})]
					})
				]
			}),
			profiles.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
				className: "p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-2xl",
						children: "No one here yet"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-mute",
						children: "Add a person, or import a resume and check it before saving."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-4",
						onClick: () => go({
							name: "import",
							profileId: null
						}),
						children: "Import a document"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-3",
				children: profiles.map((profile, index) => {
					const stats = profileStats(profile);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "rise",
						style: { animationDelay: `${index * 70}ms` },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => go({
								name: "person",
								profileId: profile.id
							}),
							className: "flex w-full items-center gap-3 rounded-2xl bg-cream p-3 text-left text-ink shadow-sheet transition-transform duration-150 ease-out active:scale-[0.96]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex size-12 shrink-0 items-center justify-center rounded-xl bg-cream-2 font-serif text-lg",
									children: initials(profile.name)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block truncate font-serif text-xl",
											children: profile.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "block text-sm text-mute",
											children: [
												profile.who,
												" · ",
												stats.sections,
												" sections · ",
												stats.filled,
												" details"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "block text-xs text-mute",
											children: ["Updated ", formatWhen(profile.updatedAt)]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
									className: "size-5 shrink-0 text-mute",
									"aria-hidden": "true"
								})
							]
						})
					}, profile.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				tone: "ghost",
				className: "self-start px-0",
				onClick: () => go({
					name: "import",
					profileId: null
				}),
				children: "Import a resume or note"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdSlot, {})
		]
	});
}
function PersonScreen({ profileId }) {
	const profile = useVault((s) => s.profiles.find((item) => item.id === profileId));
	const go = useVault((s) => s.go);
	const updateMeta = useVault((s) => s.updateProfileMeta);
	const addSection = useVault((s) => s.addSection);
	const renameSection = useVault((s) => s.renameSection);
	const removeSection = useVault((s) => s.removeSection);
	const addField = useVault((s) => s.addField);
	const updateField = useVault((s) => s.updateField);
	const removeField = useVault((s) => s.removeField);
	const removeProfile = useVault((s) => s.removeProfile);
	const setFillProfile = useVault((s) => s.setFillProfile);
	const [sectionTitle, setSectionTitle] = (0, import_react.useState)("");
	const [addingIn, setAddingIn] = (0, import_react.useState)(null);
	const [fieldLabel, setFieldLabel] = (0, import_react.useState)("");
	const [fieldValue, setFieldValue] = (0, import_react.useState)("");
	const [confirmDelete, setConfirmDelete] = (0, import_react.useState)(false);
	if (!profile) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
		className: "mx-auto max-w-xl p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-serif text-2xl",
			children: "That person is gone"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "mt-4",
			onClick: () => go({ name: "people" }),
			children: "Back to people"
		})]
	});
	const stats = profileStats(profile);
	const whoKnown = WHO_OPTIONS.includes(profile.who);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex w-full max-w-xl flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
				className: "p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "text-xs font-medium tracking-widest text-mute uppercase",
						htmlFor: "profile-name",
						children: "Profile name"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaperInput, {
						id: "profile-name",
						className: "mt-2 font-serif text-xl",
						value: profile.name,
						onChange: (event) => updateMeta(profile.id, { name: event.target.value })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs font-medium tracking-widest text-mute uppercase",
						children: "Who they are"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex flex-wrap gap-2",
						children: WHO_OPTIONS.map((option) => {
							const selected = whoKnown ? profile.who === option : option === "Other";
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": selected,
								onClick: () => updateMeta(profile.id, { who: option === "Other" ? "Other" : option }),
								className: `min-h-11 rounded-full px-3 text-sm ${selected ? "bg-stamp text-cream" : "bg-cream-2 text-ink"}`,
								children: option
							}, option);
						})
					}),
					!whoKnown && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaperInput, {
						className: "mt-3",
						value: profile.who,
						"aria-label": "Custom relationship",
						onChange: (event) => updateMeta(profile.id, { who: event.target.value })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm text-mute",
						children: [
							stats.sections,
							" sections · ",
							stats.filled,
							" filled details"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => {
								setFillProfile(profile.id);
								go({ name: "fill" });
							},
							children: "Use on a form"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							tone: "quiet",
							onClick: () => go({
								name: "import",
								profileId: profile.id
							}),
							children: "Import into this profile"
						})]
					})
				]
			}),
			profile.sections.map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
				className: "p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							"aria-label": "Section name",
							value: section.title,
							onChange: (event) => renameSection(profile.id, section.id, event.target.value),
							className: "min-h-11 w-full bg-transparent font-serif text-2xl text-ink outline-none"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
							className: "text-clay-ink",
							"aria-label": `Remove ${section.title}`,
							onClick: () => removeSection(profile.id, section.id),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 flex flex-col",
						children: section.fields.map((field) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "border-t border-rule py-3 first:border-t-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										"aria-label": "Field label",
										value: field.label,
										onChange: (event) => updateField(profile.id, section.id, field.id, { label: event.target.value }),
										className: "w-full bg-transparent text-xs font-medium tracking-widest text-mute uppercase outline-none"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										"aria-label": field.label,
										value: field.value,
										onChange: (event) => updateField(profile.id, section.id, field.id, { value: event.target.value }),
										className: "mt-1 min-h-11 w-full bg-transparent text-base text-ink outline-none"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
									className: "text-mute",
									"aria-label": `Remove ${field.label}`,
									onClick: () => removeField(profile.id, section.id, field.id),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
								})]
							})
						}, field.id))
					}),
					addingIn === section.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 border-t border-rule pt-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaperInput, {
								placeholder: "Field name",
								value: fieldLabel,
								onChange: (event) => setFieldLabel(event.target.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaperInput, {
								className: "mt-2",
								placeholder: "Value",
								value: fieldValue,
								onChange: (event) => setFieldValue(event.target.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									disabled: !fieldLabel.trim(),
									onClick: () => {
										addField(profile.id, section.id, fieldLabel, fieldValue);
										setFieldLabel("");
										setFieldValue("");
										setAddingIn(null);
									},
									children: "Add field"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									tone: "quiet",
									onClick: () => setAddingIn(null),
									children: "Cancel"
								})]
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "mt-2 min-h-11 text-sm font-medium text-stamp",
						onClick: () => {
							setAddingIn(section.id);
							setFieldLabel("");
							setFieldValue("");
						},
						children: "Add a field"
					})
				]
			}, section.id)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
				className: "p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-xl",
						children: "New section"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaperInput, {
						className: "mt-2",
						placeholder: "Health, Travel, School…",
						value: sectionTitle,
						onChange: (event) => setSectionTitle(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-3",
						tone: "quiet",
						disabled: !sectionTitle.trim(),
						onClick: () => {
							addSection(profile.id, sectionTitle);
							setSectionTitle("");
						},
						children: "Add section"
					})
				]
			}),
			!confirmDelete ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "min-h-11 self-start text-sm text-clay",
				onClick: () => setConfirmDelete(true),
				children: "Remove this profile"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
				className: "p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm",
					children: [
						"Remove ",
						profile.name,
						"? This deletes the copy in this browser only."
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						tone: "quiet",
						className: "text-clay-ink",
						onClick: () => removeProfile(profile.id),
						children: "Remove"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						tone: "quiet",
						onClick: () => setConfirmDelete(false),
						children: "Keep"
					})]
				})]
			})
		]
	});
}
function SyncScreen() {
	const profiles = useVault((s) => s.profiles);
	const resetSamples = useVault((s) => s.resetSamples);
	const [confirm, setConfirm] = (0, import_react.useState)(false);
	const [exported, setExported] = (0, import_react.useState)(false);
	const download = () => {
		const blob = new Blob([JSON.stringify({ profiles }, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "formfill-profiles.json";
		link.click();
		URL.revokeObjectURL(url);
		setExported(true);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex w-full max-w-xl flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-3xl text-cream",
				children: "Sync"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-cream/70",
				children: "Where the copy is meant to live, and where it actually lives in this preview."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
				className: "p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-widest text-mute uppercase",
						children: "This browser"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 font-serif text-2xl",
						children: "On this device only"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-mute",
						children: "Profiles stay in this browser so you can leave and come back. That is ordinary storage for the design, not the encrypted vault. Nothing is sent to an account."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
				className: "p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-widest text-mute uppercase",
						children: "Google account"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 font-serif text-2xl",
						children: "Not connected"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-mute",
						children: "The direction is one encrypted copy on the device, synced between the app and the extension through your Google account, including offline. Sync is not built here, so there is no connect button to pretend otherwise."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm font-medium text-clay-ink",
						children: "Still to build"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
				className: "p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-widest text-mute uppercase",
						children: "Ads"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 font-serif text-2xl",
						children: "Free, not targeted"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-mute",
						children: "The product direction is free with ads. The ad below does not change based on who you have saved, and it cannot — it is not given the profiles."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdSlot, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					tone: "paper",
					onClick: download,
					children: "Download a copy"
				}), !confirm ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					tone: "ghost",
					onClick: () => setConfirm(true),
					children: "Restore samples"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					tone: "paper",
					onClick: () => {
						resetSamples();
						setConfirm(false);
					},
					children: "Replace with Amina and Farhan"
				})]
			}),
			exported && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-cream/70",
				children: "Downloaded formfill-profiles.json."
			})
		]
	});
}
var NAV = [
	{
		name: "people",
		label: "People",
		icon: Users
	},
	{
		name: "fill",
		label: "Fill",
		icon: ClipboardCheck
	},
	{
		name: "flow",
		label: "Flow",
		icon: Route
	},
	{
		name: "sync",
		label: "Sync",
		icon: Lock
	}
];
function Desk() {
	const screen = useVault((s) => s.screen);
	const go = useVault((s) => s.go);
	const profiles = useVault((s) => s.profiles);
	const back = (() => {
		if (screen.name === "person" || screen.name === "import" && !screen.profileId) return { name: "people" };
		if (screen.name === "import" && screen.profileId) return {
			name: "person",
			profileId: screen.profileId
		};
		return null;
	})();
	const title = screen.name === "person" ? profiles.find((profile) => profile.id === screen.profileId)?.name ?? "Person" : screen.name === "import" ? "Import" : screen.name === "fill" ? "Fill" : screen.name === "flow" ? "Flow" : screen.name === "sync" ? "Sync" : "People";
	const active = (name) => {
		if (name === "people") return screen.name === "people" || screen.name === "person" || screen.name === "import";
		return screen.name === name;
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-desk text-cream",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-20 border-b border-edge bg-desk/95 backdrop-blur-md",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex w-full max-w-6xl items-center gap-1 px-2 py-2 lg:px-6",
					children: [
						back ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
							"aria-label": "Back",
							onClick: () => go(back),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-5" })
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-2",
							"aria-hidden": "true"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-auto pr-3 text-sm text-cream/60 lg:hidden",
							children: title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "ml-auto hidden lg:block",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Nav, {
								active,
								onGo: go,
								layout: "row"
							})
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: `mx-auto w-full max-w-6xl px-4 pt-4 lg:px-6 ${screen.name === "fill" ? "pb-40" : "pb-24"} lg:pb-16`,
				children: [
					screen.name === "people" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PeopleScreen, {}),
					screen.name === "person" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonScreen, { profileId: screen.profileId }),
					screen.name === "import" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportScreen, { profileId: screen.profileId }),
					screen.name === "fill" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FillScreen, {}),
					screen.name === "flow" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlowScreen, {}),
					screen.name === "sync" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SyncScreen, {})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "dock fixed inset-x-0 bottom-0 z-20 border-t border-edge bg-desk/95 lg:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Nav, {
					active,
					onGo: go,
					layout: "dock"
				})
			})
		]
	});
}
function Nav({ active, onGo, layout }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: layout === "dock" ? "grid h-16 grid-cols-4" : "flex items-center gap-1",
		children: NAV.map((item) => {
			const Icon = item.icon;
			const on = active(item.name);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				"aria-current": on ? "page" : void 0,
				onClick: () => onGo({ name: item.name }),
				className: layout === "dock" ? `flex flex-col items-center justify-center gap-0.5 text-xs ${on ? "text-cream" : "text-cream/50"}` : `inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm ${on ? "bg-cream text-ink" : "text-cream/70"}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					className: "size-5",
					"aria-hidden": "true"
				}), item.label]
			}, item.name);
		})
	});
}
function Home() {
	const hydrate = useVault((s) => s.hydrate);
	(0, import_react.useEffect)(() => {
		hydrate();
	}, [hydrate]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Desk, {});
}
//#endregion
export { Home as component };
