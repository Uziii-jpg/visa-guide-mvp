import fs from 'fs';
import path from 'path';
import { CountryVisaConfig, VisaTemplate, RequirementBlock, VisaMeta, VisaStep } from '@/types/visaSchema';

const DATA_ROOT = path.join(process.cwd(), 'data');

import { translateData } from './i18n';

export async function getVisaData(countryCode: string, visaType: string, locale: string = 'en') {
    // 1. Load Country Config
    const configPath = path.join(DATA_ROOT, 'COUNTRIES', `${countryCode}_${visaType}.json`);

    if (!fs.existsSync(configPath)) {
        throw new Error(`Visa configuration not found for ${countryCode} - ${visaType} at path: ${configPath}`);
    }

    const countryConfig: CountryVisaConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    // 2. Load Template (if applicable)
    let templateData: VisaTemplate | null = null;
    if (countryConfig.template_ref) {
        const templatePath = path.join(DATA_ROOT, 'TEMPLATES', `${countryConfig.template_ref}.json`);
        if (fs.existsSync(templatePath)) {
            templateData = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
        }
    }

    // 3. Merge Data
    const finalData = mergeData(countryConfig, templateData);

    // 4. Translate Data
    return await translateData(finalData, locale);
}

function mergeData(config: CountryVisaConfig, template: VisaTemplate | null) {
    // 0. Check for Standalone Data
    if (config.standalone_data) {
        return {
            meta: config.standalone_data.meta,
            documents: config.standalone_data.documents,
            steps_flow: config.standalone_data.steps_flow,
            university_guide: config.university_guide,
            eligibility: config.eligibility,
            source_template: 'STANDALONE',
            country_code: config.country_code
        };
    }

    // Start with template data or empty base
    const baseMeta = template?.base_requirements.meta || {} as VisaMeta;
    const baseDocs = template?.base_requirements.documents || [];
    const baseSteps = template?.base_requirements.steps_flow || [];

    // Apply Meta Overrides
    const finalMeta = { ...baseMeta, ...config.overrides?.meta };

    // Apply Document Overrides
    let finalDocs = [...baseDocs];

    if (config.overrides?.documents) {
        if (Array.isArray(config.overrides.documents)) {
            finalDocs = config.overrides.documents;
        } else {
            const docsOverride = config.overrides.documents;

            // Remove
            if (docsOverride.remove) {
                finalDocs = finalDocs.filter(doc => !docsOverride.remove!.includes(doc.id));
            }

            // Modify
            if (docsOverride.modify) {
                finalDocs = finalDocs.map(doc => {
                    const modification = docsOverride.modify!.find(m => m.id === doc.id);
                    return modification ? { ...doc, ...modification } : doc;
                });
            }

            // Add
            if (docsOverride.add) {
                finalDocs = [...finalDocs, ...docsOverride.add];
            }
        }
    }

    // Apply Step Overrides (Replace strategy for now)
    const finalSteps = config.overrides?.steps_flow || baseSteps;

    return {
        meta: finalMeta,
        documents: finalDocs,
        steps_flow: finalSteps,
        university_guide: config.university_guide,
        eligibility: config.eligibility,
        source_template: template?.template_id,
        country_code: config.country_code
    };
}

export async function getAllAvailableVisas() {
    const countriesDir = path.join(DATA_ROOT, 'COUNTRIES');
    if (!fs.existsSync(countriesDir)) return [];

    const files = fs.readdirSync(countriesDir);
    const visas = files
        .filter(file => file.endsWith('.json'))
        .map(file => {
            const [countryCode, visaType] = file.replace('.json', '').split('_');
            return {
                countryCode,
                visaType,
                fileName: file
            };
        });

    return visas;
}

export async function getAvailableVisaTypes(countryCode: string) {
    const countriesDir = path.join(DATA_ROOT, 'COUNTRIES');
    if (!fs.existsSync(countriesDir)) return [];

    const files = fs.readdirSync(countriesDir);
    const types = files
        .filter(file => file.startsWith(`${countryCode}_`) && file.endsWith('.json'))
        .map(file => file.replace(`${countryCode}_`, '').replace('.json', ''));

    return types;
}
