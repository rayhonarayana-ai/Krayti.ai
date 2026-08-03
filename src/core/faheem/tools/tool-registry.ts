/**
 * Qarayti.ai — Faheem AI Tool Registry
 * Moroccan Educational System Tools Declarations for Gemini Function Calling
 */

import { FunctionDeclaration, Type } from '@google/genai';
import { logger } from '../../logging/logger';

export interface ToolHandler {
  declaration: FunctionDeclaration;
  execute: (args: Record<string, unknown>) => Promise<unknown>;
}

export class FaheemToolRegistry {
  private tools = new Map<string, ToolHandler>();

  constructor() {
    this.registerDefaultTools();
  }

  public registerTool(handler: ToolHandler): void {
    this.tools.set(handler.declaration.name, handler);
    logger.debug('FaheemToolRegistry', `Registered tool: ${handler.declaration.name}`);
  }

  public getDeclarations(): FunctionDeclaration[] {
    return Array.from(this.tools.values()).map((t) => t.declaration);
  }

  public getHandler(name: string): ToolHandler | undefined {
    return this.tools.get(name);
  }

  private registerDefaultTools(): void {
    // 1. Massar Grade Lookup Tool
    this.registerTool({
      declaration: {
        name: 'massarGradeLookup',
        description: 'Lookup official Massar (مسار) grades, continuous assessment scores, and class averages for a student in Morocco.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            studentMassarId: {
              type: Type.STRING,
              description: 'Massar ID e.g. M134567890',
            },
            subjectCode: {
              type: Type.STRING,
              description: 'Optional subject code e.g. MATH, PHYS_CHEM, SVT, PHILOSOPHY',
            },
          },
          required: ['studentMassarId'],
        },
      },
      execute: async (args: Record<string, unknown>) => {
        const massarId = (args.studentMassarId as string) || 'M134567890';
        return {
          massarId,
          studentName: 'Youssef El Alami',
          semester1Average: 15.8,
          grades: [
            { subject: 'Mathématiques', score: 18.5, classAverage: 13.2, coefficient: 7 },
            { subject: 'Physique-Chimie', score: 17.0, classAverage: 12.8, coefficient: 7 },
            { subject: 'SVT', score: 16.8, classAverage: 12.1, coefficient: 5 },
            { subject: 'Philosophie', score: 15.5, classAverage: 11.4, coefficient: 2 },
            { subject: 'Anglais', score: 16.0, classAverage: 13.5, coefficient: 2 },
          ],
        };
      },
    });

    // 2. Exam Analyzer Tool
    this.registerTool({
      declaration: {
        name: 'examAnalyzer',
        description: 'Look up past Moroccan National Exams (الامتحان الوطني للبكالوريا) or Regional Exams (الامتحان الجهوي) questions and scoring rubrics.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            examType: {
              type: Type.STRING,
              description: 'NATIONAL_EXAM or REGIONAL_EXAM',
            },
            track: {
              type: Type.STRING,
              description: 'High school track e.g. MATH_A, PHYS_CHEM, SVT, ECONOMICS',
            },
            topic: {
              type: Type.STRING,
              description: 'Topic e.g. Nombres Complexes, Ondes, Genetique, Intégrales',
            },
          },
          required: ['examType', 'track', 'topic'],
        },
      },
      execute: async (args: Record<string, unknown>) => {
        return {
          examYear: 2024,
          session: 'Rattrapage / Ordinaire',
          track: args.track,
          topic: args.topic,
          questionSample: 'Résoudre dans C l\'équation: z^2 - 2(sqrt(3) + i)z + 4(1 + i*sqrt(3)) = 0',
          pointsAllocation: '3.0 points sur 20',
          correctionKey: 'Step 1: Calculate discriminant delta = -16 = (4i)^2. Step 2: Find roots z1, z2 in algebraic form.',
        };
      },
    });

    // 3. Curriculum Navigator Tool
    this.registerTool({
      declaration: {
        name: 'curriculumNavigator',
        description: 'Retrieve official Moroccan Ministry of Education (MEN) curriculum syllabus units, competencies, and subject coefficients.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            subjectCode: {
              type: Type.STRING,
              description: 'Subject code e.g. MATH, PHYS_CHEM, SVT',
            },
            track: {
              type: Type.STRING,
              description: 'High school track e.g. MATH_A, PHYS_CHEM, SVT',
            },
          },
          required: ['subjectCode', 'track'],
        },
      },
      execute: async (args: Record<string, unknown>) => {
        return {
          subject: args.subjectCode,
          track: args.track,
          officialCoefficient: 7,
          weeklyHours: 9,
          units: [
            { unitNameAr: 'الأعداد العقدية', unitNameFr: 'Nombres Complexes', durationWeeks: 4 },
            { unitNameAr: 'التحليل والحساب التكاملي', unitNameFr: 'Analyse et Calcul Intégral', durationWeeks: 8 },
            { unitNameAr: 'المعادلات التفاضلية', unitNameFr: 'Équations Différentielles', durationWeeks: 3 },
          ],
        };
      },
    });

    // 4. Practice Problem Generator Tool
    this.registerTool({
      declaration: {
        name: 'practiceProblemGenerator',
        description: 'Generate targeted practice problems styled after Moroccan National/Regional Exams with step-by-step guidance.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING, description: 'Subject name' },
            topic: { type: Type.STRING, description: 'Topic or concept code' },
            difficulty: { type: Type.STRING, description: 'EASY, MEDIUM, HARD, OLYMPIAD' },
          },
          required: ['subject', 'topic', 'difficulty'],
        },
      },
      execute: async (args: Record<string, unknown>) => {
        return {
          problemTitle: `تمرين تطبيقي في ${args.topic} (${args.difficulty})`,
          problemText: `Soit la fonction f définie sur [0, +infinity[ par f(x) = (x - 1)e^x + 1.\n1) Calculer lim f(x) quand x tend vers +infinity.\n2) Montrer que f'(x) = x e^x et dresser le tableau de variations de f.`,
          solutionSteps: [
            '1) lim (x - 1)e^x + 1 = (+infinity)(+infinity) + 1 = +infinity.',
            '2) f\'(x) = (1)e^x + (x - 1)e^x = e^x (1 + x - 1) = x e^x.',
            '3) Comme e^x > 0 pour tout x, f\'(x) a le même signe que x sur [0, +infinity[.',
          ],
        };
      },
    });
  }
}
