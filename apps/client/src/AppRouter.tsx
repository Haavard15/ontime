import React from 'react';
import {
  createRoutesFromChildren,
  matchRoutes,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';
import * as Sentry from '@sentry/react';

import { useClientPath } from './common/hooks/useClientPath';
import Log from './features/log/Log';
import withPreset from './features/PresetWrapper';
import withData from './features/viewers/ViewWrapper';
import { ONTIME_VERSION } from './ONTIME_VERSION';
import { sentryDsn, sentryRecommendedIgnore } from './sentry.config';
import { Playback, TimerPhase, TimerType } from 'ontime-types';

const Editor = React.lazy(() => import('./features/editors/ProtectedEditor'));
const Cuesheet = React.lazy(() => import('./features/cuesheet/ProtectedCuesheet'));
const Operator = React.lazy(() => import('./features/operator/OperatorExport'));

const TimerView = React.lazy(() => import('./features/viewers/timer/Timer'));
const MinimalTimerView = React.lazy(() => import('./features/viewers/minimal-timer/MinimalTimer'));
const PopOutTimer = React.lazy(() => import('./features/viewers/pop-out-clock/PopOutTimer'));
const ClockView = React.lazy(() => import('./features/viewers/clock/Clock'));
const Countdown = React.lazy(() => import('./features/viewers/countdown/Countdown'));

const Backstage = React.lazy(() => import('./features/viewers/backstage/Backstage'));
const Timeline = React.lazy(() => import('./features/viewers/timeline/TimelinePage'));
const Public = React.lazy(() => import('./features/viewers/public/Public'));
const Lower = React.lazy(() => import('./features/viewers/lower-thirds/LowerThird'));
const StudioClock = React.lazy(() => import('./features/viewers/studio/StudioClock'));

const STimer = withPreset(withData(TimerView));
const SMinimalTimer = withPreset(withData(MinimalTimerView));
const SClock = withPreset(withData(ClockView));
const SCountdown = withPreset(withData(Countdown));
const SBackstage = withPreset(withData(Backstage));
const SPublic = withPreset(withData(Public));
const SLowerThird = withPreset(withData(Lower));
const SStudio = withPreset(withData(StudioClock));
const STimeline = withPreset(withData(Timeline));

const EditorFeatureWrapper = React.lazy(() => import('./features/EditorFeatureWrapper'));
const RundownPanel = React.lazy(() => import('./features/rundown/RundownExport'));
const TimerControl = React.lazy(() => import('./features/control/playback/TimerControlExport'));
const MessageControl = React.lazy(() => import('./features/control/message/MessageControlExport'));

Sentry.init({
  dsn: sentryDsn,
  integrations: [
    Sentry.reactRouterV6BrowserTracingIntegration({
      useEffect: React.useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
  ],
  tracesSampleRate: 0.3,
  release: ONTIME_VERSION,
  enabled: import.meta.env.PROD,
  ignoreErrors: [...sentryRecommendedIgnore, /Unable to preload CSS/i, /dynamically imported module/i],
  denyUrls: [/extensions\//i, /^chrome:\/\//i, /^chrome-extension:\/\//i],
});

const SentryRoutes = Sentry.withSentryReactRouterV6Routing(Routes);

export default function AppRouter() {
  // handle client path changes
  useClientPath();

  return (
    <React.Suspense fallback={null}>
      <PopOutTimer 
      isMirrored={false} 
      time={{
        addedTime: 0,
        current: null,
        duration: null,
        elapsed: null,
        expectedFinish: null,
        finishedAt: null,
        phase: TimerPhase.Default,
        playback: Playback.Play,
        secondaryTimer: null,
        startedAt: null,
        clock: 0,
        timerType: TimerType.CountDown
      }} 
      viewSettings={{
        dangerColor: '',
        endMessage: '',
        freezeEnd: false,
        normalColor: '',
        overrideStyles: false,
        warningColor: ''
      }} />
      <SentryRoutes>
        <Route path='/' element={<Navigate to='/timer' />} />
        <Route path='/timer' element={<STimer />} />
        <Route path='/public' element={<SPublic />} />
        <Route path='/minimal' element={<SMinimalTimer />} />
        <Route path='/clock' element={<SClock />} />

        <Route path='/countdown' element={<SCountdown />} />
        <Route path='/backstage' element={<SBackstage />} />
        <Route path='/studio' element={<SStudio />} />
        <Route path='/lower' element={<SLowerThird />} />
        <Route path='/timeline' element={<STimeline />} />

        {/*/!* Protected Routes *!/*/}
        <Route path='/editor' element={<Editor />} />
        <Route path='/cuesheet' element={<Cuesheet />} />
        <Route path='/op' element={<Operator />} />

        {/*/!* Protected Routes - Elements *!/*/}
        <Route
          path='/rundown'
          element={
            <EditorFeatureWrapper>
              <RundownPanel />
            </EditorFeatureWrapper>
          }
        />
        <Route
          path='/timercontrol'
          element={
            <EditorFeatureWrapper>
              <TimerControl />
            </EditorFeatureWrapper>
          }
        />
        <Route
          path='/messagecontrol'
          element={
            <EditorFeatureWrapper>
              <MessageControl />
            </EditorFeatureWrapper>
          }
        />
        <Route
          path='/log'
          element={
            <EditorFeatureWrapper>
              <Log />
            </EditorFeatureWrapper>
          }
        />
        {/*/!* Send to default if nothing found *!/*/}
        <Route path='*' element={<STimer />} />
      </SentryRoutes>
    </React.Suspense>
  );
}
