import { z } from 'zod';
import { ErrorTimeline } from '../components/dashboard/ErrorTimeline';
import { ImpactMetrics } from '../components/dashboard/ImpactMetrics';
import { StackTraceAnnotated } from '../components/dashboard/StackTraceAnnotated';
import { SuggestedFixCard } from '../components/dashboard/SuggestedFixCard';
import { UserJourneyFlow } from '../components/dashboard/UserJourneyFlow';
import { InfrastructureHealth } from '../components/dashboard/InfrastructureHealth';
import { SimilarErrorsTable } from '../components/dashboard/SimilarErrorsTable';
import { QuickActionsPanel } from '../components/dashboard/QuickActionsPanel';
import { RelatedDocsWidget } from '../components/dashboard/RelatedDocsWidget';

// Define the component array type manually since we don't have the SDK types available globally yet
// In a real app we'd import { TamboComponent } from '@tambo-ai/react'
// but for now we'll match the structure required by the provider

export const dashboardComponents = [
  {
    name: "ErrorTimeline",
    description: "Shows when errors occurred over time with deployment markers. Use this when the user asks about error frequency, trends, or when the error started.",
    component: ErrorTimeline,
    propsSchema: z.object({
      range: z.enum(['1h', '24h', '7d', '30d']).optional().describe("The time range to display"),
      showDeployments: z.boolean().optional().describe("Whether to show deployment markers"),
    }),
  },
  {
    name: "ImpactMetrics",
    description: "Shows key business and user impact metrics including affected users, revenue at risk, and geographic distribution. Use this when the user asks about severity, impact, or who is affected.",
    component: ImpactMetrics,
    propsSchema: z.object({
      users: z.number().optional(),
      sessions: z.number().optional(),
      revenue: z.number().optional(),
      severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      firstDetected: z.number().optional(),
      peakTime: z.number().optional(),
      regions: z.array(z.object({
        name: z.string(),
        count: z.number(),
        percent: z.number(),
      })).optional(),
    }),
  },
  {
    name: "StackTrace",
    description: "Displays a syntax-highlighted stack trace with AI analysis and error highlighting. Use this when the user wants to see the code, debug the specific error, or look at technical details.",
    component: StackTraceAnnotated,
    propsSchema: z.object({
      filename: z.string().optional(),
      errorLine: z.number().optional(),
      aiExplanation: z.string().optional(),
      lines: z.array(z.object({
        number: z.number(),
        content: z.string(),
        type: z.enum(['error', 'context', 'normal']).optional(),
      })).optional(),
    }),
  },
  {
    name: "SuggestedFix",
    description: "Shows an AI-suggested code fix with a before/after diff view and confidence score. Use this when the user asks for a solution, how to fix it, or wants to see code changes.",
    component: SuggestedFixCard,
    propsSchema: z.object({
      description: z.string().optional(),
      confidence: z.number().optional(),
      beforeCode: z.string().optional(),
      afterCode: z.string().optional(),
      appliedCount: z.number().optional(),
      teamsCount: z.number().optional(),
    }),
  },
  {
    name: "UserJourney",
    description: "Visualizes the user's path through the application leading up to the error. Use this to understand reproduction steps or user behavior.",
    component: UserJourneyFlow,
    propsSchema: z.object({
      affectedUsers: z.number().optional(),
      estimatedCartValue: z.number().optional(),
      patterns: z.array(z.string()).optional(),
      steps: z.array(z.object({
        id: z.number(),
        name: z.string(),
        time: z.string(),
        status: z.enum(['completed', 'error', 'success']),
      })).optional(),
    }),
  },
  {
    name: "InfrastructureHealth",
    description: "Displays the status of backend services, API gateways, and databases. Use this when the user suspects a system-wide outage or infrastructure issue.",
    component: InfrastructureHealth,
    propsSchema: z.object({
      alerts: z.array(z.any()).optional(),
      services: z.array(z.any()).optional(),
      recentChanges: z.array(z.any()).optional(),
    }),
  },
  {
    name: "SimilarErrors",
    description: "Shows a table of past similar errors with similarity scores and resolutions. Use this to learn from previous fixes.",
    component: SimilarErrorsTable,
    propsSchema: z.object({
      errors: z.array(z.object({
        id: z.number(),
        similarity: z.number(),
        message: z.string(),
        resolution: z.string(),
        timestamp: z.number(),
        status: z.enum(['fixed', 'partial', 'unresolved']),
      })).optional(),
    }),
  },
  {
    name: "QuickActions",
    description: "Provides actionable buttons for common responses like rollback, notify team, create ticket, or silence alerts.",
    component: QuickActionsPanel,
    propsSchema: z.object({
      actions: z.array(z.object({
        id: z.string(),
        icon: z.string(),
        label: z.string(),
      })).optional(),
      aiRecommendation: z.string().optional(),
    }),
  },
  {
    name: "RelatedDocs",
    description: "Shows relevant documentation links, Stack Overflow answers, and blog posts related to the error. Use this when the user needs more context or learning resources.",
    component: RelatedDocsWidget,
    propsSchema: z.object({
      docs: z.array(z.object({
        title: z.string(),
        url: z.string(),
        type: z.enum(['documentation', 'stackoverflow', 'github', 'blog']),
        relevance: z.number(),
        snippet: z.string().optional(),
      })).optional(),
      searchQuery: z.string().optional(),
      isLoading: z.boolean().optional(),
    }),
  },
];
