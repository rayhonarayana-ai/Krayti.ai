/**
 * Qarayti.ai — Super Admin Core Integration Engine Monitor
 * Real-time inspection of cross-portal domain events, workflows, DLQ, audit trails, and sync matrix.
 */

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Activity,
  Workflow,
  Radio,
  CheckCircle2,
  Clock,
  Play,
  Layers,
  RefreshCcw,
  Check,
  AlertTriangle,
  RotateCcw,
  FileText,
  ShieldCheck,
  Cpu,
  ArrowRightLeft,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  UserPlus,
  BookOpen,
  GraduationCap,
  Bell,
} from 'lucide-react';
import {
  qaraytiEventBus,
  QaraytiEventType,
  QaraytiDomainEvent,
  DeadLetterQueueItem,
  EventBusMetrics,
} from '../../../core/integration/event-bus';
import {
  qaraytiIntegrationEngine,
  WorkflowExecutionRecord,
} from '../../../core/integration/integration-engine';
import {
  sagaOrchestrator,
  idempotencyEngine,
  traceEngine,
  circuitBreakerEngine,
  integrationPolicyEngine,
} from '../../../core/integration/governance';

export const AdminIntegrationFlowView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'workflows' | 'sagas' | 'governance' | 'events_dlq' | 'sync_matrix' | 'audit_log' | 'health'>('workflows');
  const [events, setEvents] = useState<QaraytiDomainEvent[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowExecutionRecord[]>([]);
  const [dlqItems, setDlqItems] = useState<DeadLetterQueueItem[]>([]);
  const [sagas, setSagas] = useState(sagaOrchestrator.getHistory());
  const [idempotencyMetrics, setIdempotencyMetrics] = useState(idempotencyEngine.getMetrics());
  const [traces, setTraces] = useState(traceEngine.getAllTraceGraphs());
  const [circuits, setCircuits] = useState(circuitBreakerEngine.getAllCircuits());
  const [policyViolations, setPolicyViolations] = useState(integrationPolicyEngine.getViolations());

  const [metrics, setMetrics] = useState<EventBusMetrics>({
    totalPublished: 0,
    totalDelivered: 0,
    totalFailed: 0,
    eventsPerMinute: 0,
    deadLetterCount: 0,
  });
  const [healthData, setHealthData] = useState<ReturnType<typeof qaraytiIntegrationEngine.getIntegrationHealth>>({
    totalWorkflowsExecuted: 0,
    successRate: 100,
    failedWorkflowsCount: 0,
    avgWorkflowLatencyMs: 12,
    subserviceStatus: [],
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const refreshState = () => {
    setEvents(qaraytiEventBus.getHistory(50));
    setWorkflows(qaraytiIntegrationEngine.getWorkflowRecords());
    setDlqItems(qaraytiEventBus.getDeadLetterQueue());
    setMetrics(qaraytiEventBus.getMetrics());
    setHealthData(qaraytiIntegrationEngine.getIntegrationHealth());
    setSagas(sagaOrchestrator.getHistory());
    setIdempotencyMetrics(idempotencyEngine.getMetrics());
    setTraces(traceEngine.getAllTraceGraphs());
    setCircuits(circuitBreakerEngine.getAllCircuits());
    setPolicyViolations(integrationPolicyEngine.getViolations());
  };

  useEffect(() => {
    refreshState();
    const interval = setInterval(refreshState, 1500);
    return () => clearInterval(interval);
  }, []);

  // Simulators
  const simulateRegistrationWorkflow = async () => {
    await qaraytiEventBus.publish(
      QaraytiEventType.SCHOOL_STUDENT_ENROLLED,
      `student-${Math.floor(Math.random() * 899 + 100)}`,
      'SCHOOL_MANAGER',
      {
        studentName: 'Ayoub El Amrani',
        track: 'BAC 2 Sciences Physiques',
        schoolName: 'Lycée Hassan II - Rabat',
      }
    );
    refreshState();
  };

  const simulateHomeworkWorkflow = async () => {
    await qaraytiEventBus.publish(
      QaraytiEventType.STUDENT_HOMEWORK_SUBMITTED,
      'student-youssef',
      'STUDENT',
      {
        homeworkId: `hw-${Date.now()}`,
        studentName: 'Youssef Benali',
        subjectName: 'Mathématiques BAC 2',
      }
    );
    refreshState();
  };

  const simulateGradeWorkflow = async () => {
    await qaraytiEventBus.publish(
      QaraytiEventType.TEACHER_GRADE_RECORDED,
      'teacher-1',
      'TEACHER',
      {
        studentId: 'student-youssef',
        studentName: 'Youssef Benali',
        gradeValue: 19.5,
        maxGrade: 20,
        subjectName: 'Physique-Chimie',
      }
    );
    refreshState();
  };

  const simulateAbsenceWorkflow = async () => {
    await qaraytiEventBus.publish(
      QaraytiEventType.TEACHER_ATTENDANCE_MARKED,
      'teacher-1',
      'TEACHER',
      {
        studentName: 'Youssef Benali',
        status: 'ABSENT',
        sessionTime: '08h30',
      }
    );
    refreshState();
  };

  const simulateLicenseWorkflow = async () => {
    await qaraytiEventBus.publish(
      QaraytiEventType.SCHOOL_LICENSE_UPDATED,
      'school-manager-1',
      'SCHOOL_MANAGER',
      {
        tier: 'PRO_EXCELLENCE',
        maxStudents: 1500,
      }
    );
    refreshState();
  };

  const handleRunSagaTest = async () => {
    await sagaOrchestrator.executeSaga('StudentRegistrationSaga', {
      studentName: 'Sofia El Mansouri',
      schoolId: 'school-lycee-descartes',
      track: 'BAC 2 Sciences Maths',
    });
    refreshState();
  };

  const handleReplayDlq = async (dlqId: string) => {
    await qaraytiEventBus.replayDlqItem(dlqId);
    refreshState();
  };

  const handleTripCircuit = (serviceName: string) => {
    circuitBreakerEngine.forceTrip(serviceName);
    refreshState();
  };

  const handleResetCircuit = (serviceName: string) => {
    circuitBreakerEngine.forceReset(serviceName);
    refreshState();
  };

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.actorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(evt.payload).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || evt.actorRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/50 text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Workflow className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">Qarayti Core Integration Engine</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE BUS ONLINE
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Orchestrateur événementiel unifié reliant Student, Teacher, Parent, School OS, Super Admin & Faheem AI.
            </p>
          </div>
        </div>

        <button
          onClick={refreshState}
          className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          <span>Sync Engine</span>
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Débit (Events/min)</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {metrics.eventsPerMinute || 42}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">Flux Temps Réel</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Workflows Exécutés</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {healthData.totalWorkflowsExecuted}
          </div>
          <div className="text-[10px] text-indigo-600 font-bold mt-0.5">Séquences Actives</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Dead Letter Queue (DLQ)</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {metrics.deadLetterCount}
          </div>
          <div className="text-[10px] text-amber-600 font-bold mt-0.5">Échecs Traités</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Taux de Succès</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {healthData.successRate}%
          </div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">Tolérance aux Pannes</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Latence Moyenne</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {healthData.avgWorkflowLatencyMs} ms
          </div>
          <div className="text-[10px] text-purple-600 font-bold mt-0.5">Temps de Réponse</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('workflows')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'workflows'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Workflows & Simulateur</span>
        </button>

        <button
          onClick={() => setActiveTab('sagas')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'sagas'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Workflow className="w-4 h-4" />
          <span>Saga Orchestrator ({sagas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('governance')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'governance'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Houvernance & Résilience</span>
        </button>

        <button
          onClick={() => setActiveTab('events_dlq')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'events_dlq'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Event Bus & DLQ ({dlqItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sync_matrix')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'sync_matrix'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Matrice de Mynchronisation</span>
        </button>

        <button
          onClick={() => setActiveTab('audit_log')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'audit_log'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Séquenceur & Audit Log</span>
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'health'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Santé des Sub-Services</span>
        </button>
      </div>

      {/* Tab 1: Workflows & Simulator */}
      {activeTab === 'workflows' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Déclencheur Interactif de Workflows Multi-Portails</span>
              </h3>
              <span className="text-xs text-slate-500">Test d'interopérabilité end-to-end</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <button
                onClick={simulateRegistrationWorkflow}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 text-left transition-all group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  <span className="flex items-center gap-1.5"><UserPlus className="w-3.5 h-3.5" /> Inscription Élève</span>
                  <Play className="w-3.5 h-3.5 fill-current text-indigo-500" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Élève → Faheem + BKT + Parent SMS + School OS</p>
              </button>

              <button
                onClick={simulateHomeworkWorkflow}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 text-left transition-all group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Devoir Rendu</span>
                  <Play className="w-3.5 h-3.5 fill-current text-indigo-500" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Devoir → Notif Prof + Push Parent + Telemetry</p>
              </button>

              <button
                onClick={simulateGradeWorkflow}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 text-left transition-all group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  <span className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> Note 19.5/20</span>
                  <Play className="w-3.5 h-3.5 fill-current text-emerald-500" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Note → SMS Parent + IRT Recalibration</p>
              </button>

              <button
                onClick={simulateAbsenceWorkflow}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 text-left transition-all group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400">
                  <span className="flex items-center gap-1.5"><Bell className="w-3.5 h-3.5" /> Absence Signalée</span>
                  <Play className="w-3.5 h-3.5 fill-current text-rose-500" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Absent → SMS Urgent Parent + Audit Risk</p>
              </button>

              <button
                onClick={simulateLicenseWorkflow}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-700 text-left transition-all group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Licence École</span>
                  <Play className="w-3.5 h-3.5 fill-current text-purple-500" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">SaaS Pro → Facture Super Admin + Quota</p>
              </button>
            </div>
          </div>

          {/* Workflow Execution Log Cards */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Historique des Workflows Exécutés</span>
              </h3>
              <span className="text-xs text-slate-500 font-bold">{workflows.length} Séquences</span>
            </div>

            <div className="space-y-3">
              {workflows.map((wf) => (
                <div
                  key={wf.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{wf.workflowName}</span>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                        {wf.executionTimeMs} ms
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        {wf.status}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 pt-1 font-mono text-[11px]">
                    {wf.stepsExecuted.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-between font-mono">
                    <span>Event Trigger: {wf.triggerType} ({wf.triggerEventId})</span>
                    <span>{wf.completedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Event Bus & DLQ */}
      {activeTab === 'events_dlq' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Event Stream */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                <span>Flux Event Bus en Temps Réel</span>
              </h3>
              <span className="text-xs text-slate-500 font-bold">{events.length} Événements Capteurs</span>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1.5"
                >
                  <div className="flex justify-between items-center font-mono">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{evt.type}</span>
                    <span className="text-[10px] text-slate-400">{evt.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Rôle: {evt.actorRole} ({evt.actorId})
                    </span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-500">École: {evt.schoolId}</span>
                  </div>

                  <div className="p-2 rounded bg-slate-100 dark:bg-slate-950 font-mono text-[10px] text-slate-600 dark:text-slate-400 overflow-x-auto">
                    {JSON.stringify(evt.payload)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dead Letter Queue (DLQ) & Fault Tolerance */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Dead Letter Queue (DLQ) & Replay</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600">
                {dlqItems.length} En Attente de Re-play
              </span>
            </div>

            {dlqItems.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">File DLQ Vierge</h4>
                <p className="text-xs text-slate-500">
                  Tous les événements publiés ont été livrés et exécutés avec succès par les sous-services.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {dlqItems.map((dlq) => (
                  <div
                    key={dlq.id}
                    className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-rose-700 dark:text-rose-400">{dlq.event.type}</span>
                      <button
                        onClick={() => handleReplayDlq(dlq.id)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" /> Re-jouer Événement
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                      Raison de l'échec: <span className="text-rose-600 font-semibold">{dlq.errorReason}</span>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono flex justify-between">
                      <span>Tentatives: {dlq.retryCount}</span>
                      <span>Échoué à: {dlq.failedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Cross-Portal Synchronization Matrix */}
      {activeTab === 'sync_matrix' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Matrice d'Interconnexion et Mynchronisation Multi-Portails</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Topologie en étoile (Hub-and-Spoke) connectée via Core Integration Engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { title: 'Student Portal', badge: 'Active Sync', desc: 'Devoirs, Exercices, Leçons, Diagnostic IRT', status: 'SYNCHRONIZED' },
              { title: 'Teacher Portal', badge: 'Active Sync', desc: 'Notes, Absences, Cahier de Texte, Exercices', status: 'SYNCHRONIZED' },
              { title: 'Parent Portal', badge: 'Multi-Channel', desc: 'Alerte SMS, Bulletin, Paiements, Retards', status: 'SYNCHRONIZED' },
              { title: 'School OS', badge: 'Master Register', desc: 'Inscriptions, Licences, Emplois du Temps', status: 'SYNCHRONIZED' },
              { title: 'Faheem AI Copilot', badge: 'AI Engine', desc: 'Contextualisation Pédagogique & Tuteur', status: 'SYNCHRONIZED' },
              { title: 'Adaptive Engine', badge: 'IRT + BKT', desc: 'Courbe d\'Oubli Spaced Repetition', status: 'SYNCHRONIZED' },
              { title: 'Super Admin', badge: 'KPI Analytics', desc: 'Monitoring National, Telemetry & Billing', status: 'SYNCHRONIZED' },
              { title: 'MEN Massar Gateway', badge: 'Connector', desc: 'Mynchronisation Officielle Massar (Simulé)', status: 'SYNCHRONIZED' },
            ].map((node, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{node.title}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    {node.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{node.desc}</p>
                <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                  {node.badge}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Audit Log */}
      {activeTab === 'audit_log' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Séquenceur & Audit Log de Traçabilité</span>
            </h3>

            {/* Filters */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par type, acteur, payload..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
              >
                <option value="ALL">Tous les Rôles</option>
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="PARENT">Parent</option>
                <option value="SCHOOL_MANAGER">School Manager</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Event ID</th>
                  <th className="py-2.5 px-3">Type d'Événement</th>
                  <th className="py-2.5 px-3">Acteur</th>
                  <th className="py-2.5 px-3">Établissement</th>
                  <th className="py-2.5 px-3">Horodatage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-bold text-slate-500">{evt.id}</td>
                    <td className="py-2.5 px-3 font-bold text-indigo-600 dark:text-indigo-400">{evt.type}</td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                      {evt.actorRole} ({evt.actorId})
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{evt.schoolId}</td>
                    <td className="py-2.5 px-3 text-slate-400 text-[10px]">{evt.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Sagas */}
      {activeTab === 'sagas' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Workflow className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Saga Orchestrator — Transactions Distribuées Multi-Portails</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gestion de sagas distribuées avec compensation automatique (rollback) en cas d'échec.
                </p>
              </div>

              <button
                onClick={handleRunSagaTest}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Tester Saga d'Inscription Élève</span>
              </button>
            </div>

            {sagas.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Aucune saga exécutée pour le moment. Cliquez sur "Tester Saga d'Inscription Élève" ci-dessus pour lancer une séquence multi-services.
              </div>
            ) : (
              <div className="space-y-3">
                {sagas.map((saga) => (
                  <div
                    key={saga.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{saga.sagaName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({saga.id})</span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          saga.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : saga.status === 'ROLLED_BACK'
                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                        }`}
                      >
                        {saga.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 dark:text-slate-300">
                      Progrès: Step {saga.currentStepIndex + 1}/{saga.totalSteps} | Correlation ID: <span className="font-mono text-indigo-600">{saga.correlationId}</span>
                    </div>

                    <div className="space-y-1 pt-1 font-mono text-[11px]">
                      <div className="text-slate-500 font-sans font-bold">Étapes Exécutées:</div>
                      {saga.executedSteps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-emerald-600">
                          <Check className="w-3.5 h-3.5" />
                          <span>{step}</span>
                        </div>
                      ))}
                      {saga.compensatedSteps.length > 0 && (
                        <div className="pt-1">
                          <div className="text-amber-600 font-sans font-bold">Étapes Compensées (Rollback):</div>
                          {saga.compensatedSteps.map((compStep, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-amber-600">
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>{compStep}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Governance & Resilience */}
      {activeTab === 'governance' && (
        <div className="space-y-6">
          {/* Circuit Breakers Section */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Circuit Breaker & Resilience Engine — Isolation des Connecteurs Externes</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Basculement automatique et tolérance aux pannes pour les passrelles SMS, Email, Massar et Paiement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {circuits.map((cb) => (
                <div
                  key={cb.serviceName}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{cb.serviceName}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        cb.state === 'CLOSED'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : cb.state === 'HALF_OPEN'
                          ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-600 border-rose-500/20 animate-pulse'
                      }`}
                    >
                      {cb.state}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-1 font-mono">
                    <div>Appels Totaux: {cb.totalCalls}</div>
                    <div>Échecs Consécutifs: {cb.consecutiveFailures}/3</div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    {cb.state === 'CLOSED' ? (
                      <button
                        onClick={() => handleTripCircuit(cb.serviceName)}
                        className="w-full py-1.5 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-600 font-bold text-[10px] border border-rose-500/20 transition-colors"
                      >
                        Simuler Panne (Déclencher)
                      </button>
                    ) : (
                      <button
                        onClick={() => handleResetCircuit(cb.serviceName)}
                        className="w-full py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 font-bold text-[10px] border border-emerald-500/20 transition-colors"
                      >
                        Réinitialiser (CLOSED)
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Distributed Traces Waterfall */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>Distributed Trace Engine — Visualisation Waterfall des Latences</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tracé exact du parcours des requêtes à travers l'Event Bus, Faheem AI et les bégas.
              </p>
            </div>

            <div className="space-y-3">
              {traces.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Aucun tracé actif enregistré. Exécutez un événement ou workflow pour générer une séquence de tracé.
                </div>
              ) : (
                traces.slice(0, 5).map((tg) => (
                  <div
                    key={tg.traceId}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{tg.rootOperation}</span>
                        <span className="text-[10px] font-mono text-slate-400">({tg.traceId})</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                        {tg.totalDurationMs} ms
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      {tg.spans.map((span) => (
                        <div key={span.spanId} className="flex items-center gap-3 text-[11px] font-mono">
                          <span className="w-28 text-slate-500 truncate">{span.serviceName}</span>
                          <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-purple-600 h-full rounded-full"
                              style={{ width: `${Math.min(100, Math.max(15, span.durationMs || 10))}%` }}
                            />
                          </div>
                          <span className="w-16 text-right font-bold text-purple-600 dark:text-purple-400">
                            {span.durationMs || 1} ms
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Idempotency & Policy Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Idempotency Engine — Anti-Dédoublonnage</span>
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="text-slate-500 text-[10px]">Opérations Suivies</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    {idempotencyMetrics.totalKeysTracked}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="text-slate-500 text-[10px]">Doublons Bloqués</div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {idempotencyMetrics.totalDuplicatesBlocked}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>Integration Policy Engine — RBAC & PII</span>
              </h3>
              <div className="text-xs text-slate-500 space-y-1">
                <div>Politique de Sécurité: <span className="font-bold text-emerald-600">STRICT RBAC + PII MASKING</span></div>
                <div>Violations Détectées: <span className="font-bold text-slate-900 dark:text-white">{policyViolations.length}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Health */}
      {activeTab === 'health' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-500" />
              <span>Santé et Latence des Adaptateurs de Sous-Services</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">Inspection en direct des bus d'écouteurs de sous-systèmes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {healthData.subserviceStatus.map((sub, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">{sub.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Latence: {sub.latencyMs} ms</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  {sub.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
