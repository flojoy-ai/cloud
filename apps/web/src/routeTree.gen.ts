/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as PublicImport } from './routes/_public'
import { Route as ProtectedImport } from './routes/_protected'
import { Route as PublicSignupImport } from './routes/_public/signup'
import { Route as PublicLoginImport } from './routes/_public/login'
import { Route as ProtectedSetupImport } from './routes/_protected/setup'
import { Route as ProtectedWorkspaceIndexImport } from './routes/_protected/workspace/index'
import { Route as ProtectedProfileIndexImport } from './routes/_protected/profile/index'
import { Route as ProtectedWorkspaceNamespaceRouteImport } from './routes/_protected/workspace/$namespace/route'
import { Route as ProtectedWorkspaceNamespaceIndexImport } from './routes/_protected/workspace/$namespace/index'
import { Route as ProtectedWorkspaceNamespaceUnitRouteImport } from './routes/_protected/workspace/$namespace/unit/route'
import { Route as ProtectedWorkspaceNamespaceStationRouteImport } from './routes/_protected/workspace/$namespace/station/route'
import { Route as ProtectedWorkspaceNamespaceSettingsRouteImport } from './routes/_protected/workspace/$namespace/settings/route'
import { Route as ProtectedWorkspaceNamespaceProjectRouteImport } from './routes/_protected/workspace/$namespace/project/route'
import { Route as ProtectedWorkspaceNamespaceSettingsIndexImport } from './routes/_protected/workspace/$namespace/settings/index'
import { Route as ProtectedWorkspaceNamespaceProjectIndexImport } from './routes/_protected/workspace/$namespace/project/index'
import { Route as ProtectedWorkspaceNamespacePartIndexImport } from './routes/_protected/workspace/$namespace/part/index'
import { Route as ProtectedWorkspaceNamespaceDashboardIndexImport } from './routes/_protected/workspace/$namespace/dashboard/index'
import { Route as ProtectedWorkspaceNamespaceVariationPartVariationIdRouteImport } from './routes/_protected/workspace/$namespace/variation/$partVariationId/route'
import { Route as ProtectedWorkspaceNamespaceUnitUnitIdRouteImport } from './routes/_protected/workspace/$namespace/unit/$unitId/route'
import { Route as ProtectedWorkspaceNamespaceTestTestIdRouteImport } from './routes/_protected/workspace/$namespace/test/$testId/route'
import { Route as ProtectedWorkspaceNamespaceStationStationIdRouteImport } from './routes/_protected/workspace/$namespace/station/$stationId/route'
import { Route as ProtectedWorkspaceNamespaceProjectProjectIdRouteImport } from './routes/_protected/workspace/$namespace/project/$projectId/route'
import { Route as ProtectedWorkspaceNamespacePartPartIdRouteImport } from './routes/_protected/workspace/$namespace/part/$partId/route'
import { Route as ProtectedWorkspaceNamespaceVariationPartVariationIdIndexImport } from './routes/_protected/workspace/$namespace/variation/$partVariationId/index'
import { Route as ProtectedWorkspaceNamespaceUnitUnitIdIndexImport } from './routes/_protected/workspace/$namespace/unit/$unitId/index'
import { Route as ProtectedWorkspaceNamespaceTestTestIdIndexImport } from './routes/_protected/workspace/$namespace/test/$testId/index'
import { Route as ProtectedWorkspaceNamespaceStationStationIdIndexImport } from './routes/_protected/workspace/$namespace/station/$stationId/index'
import { Route as ProtectedWorkspaceNamespaceSessionSessionIdIndexImport } from './routes/_protected/workspace/$namespace/session/$sessionId/index'
import { Route as ProtectedWorkspaceNamespaceProjectProjectIdIndexImport } from './routes/_protected/workspace/$namespace/project/$projectId/index'
import { Route as ProtectedWorkspaceNamespacePartPartIdIndexImport } from './routes/_protected/workspace/$namespace/part/$partId/index'

// Create Virtual Routes

const PublicIndexLazyImport = createFileRoute('/_public/')()

// Create/Update Routes

const PublicRoute = PublicImport.update({
  id: '/_public',
  getParentRoute: () => rootRoute,
} as any)

const ProtectedRoute = ProtectedImport.update({
  id: '/_protected',
  getParentRoute: () => rootRoute,
} as any)

const PublicIndexLazyRoute = PublicIndexLazyImport.update({
  path: '/',
  getParentRoute: () => PublicRoute,
} as any).lazy(() => import('./routes/_public/index.lazy').then((d) => d.Route))

const PublicSignupRoute = PublicSignupImport.update({
  path: '/signup',
  getParentRoute: () => PublicRoute,
} as any)

const PublicLoginRoute = PublicLoginImport.update({
  path: '/login',
  getParentRoute: () => PublicRoute,
} as any)

const ProtectedSetupRoute = ProtectedSetupImport.update({
  path: '/setup',
  getParentRoute: () => ProtectedRoute,
} as any)

const ProtectedWorkspaceIndexRoute = ProtectedWorkspaceIndexImport.update({
  path: '/workspace/',
  getParentRoute: () => ProtectedRoute,
} as any)

const ProtectedProfileIndexRoute = ProtectedProfileIndexImport.update({
  path: '/profile/',
  getParentRoute: () => ProtectedRoute,
} as any)

const ProtectedWorkspaceNamespaceRouteRoute =
  ProtectedWorkspaceNamespaceRouteImport.update({
    path: '/workspace/$namespace',
    getParentRoute: () => ProtectedRoute,
  } as any)

const ProtectedWorkspaceNamespaceIndexRoute =
  ProtectedWorkspaceNamespaceIndexImport.update({
    path: '/',
    getParentRoute: () => ProtectedWorkspaceNamespaceRouteRoute,
  } as any)

const ProtectedWorkspaceNamespaceUnitRouteRoute =
  ProtectedWorkspaceNamespaceUnitRouteImport.update({
    path: '/unit',
    getParentRoute: () => ProtectedWorkspaceNamespaceRouteRoute,
  } as any)

const ProtectedWorkspaceNamespaceStationRouteRoute =
  ProtectedWorkspaceNamespaceStationRouteImport.update({
    path: '/station',
    getParentRoute: () => ProtectedWorkspaceNamespaceRouteRoute,
  } as any)

const ProtectedWorkspaceNamespaceSettingsRouteRoute =
  ProtectedWorkspaceNamespaceSettingsRouteImport.update({
    path: '/settings',
    getParentRoute: () => ProtectedWorkspaceNamespaceRouteRoute,
  } as any)

const ProtectedWorkspaceNamespaceProjectRouteRoute =
  ProtectedWorkspaceNamespaceProjectRouteImport.update({
    path: '/project',
    getParentRoute: () => ProtectedWorkspaceNamespaceRouteRoute,
  } as any)

const ProtectedWorkspaceNamespaceSettingsIndexRoute =
  ProtectedWorkspaceNamespaceSettingsIndexImport.update({
    path: '/',
    getParentRoute: () => ProtectedWorkspaceNamespaceSettingsRouteRoute,
  } as any)

const ProtectedWorkspaceNamespaceProjectIndexRoute =
  ProtectedWorkspaceNamespaceProjectIndexImport.update({
    path: '/',
    getParentRoute: () => ProtectedWorkspaceNamespaceProjectRouteRoute,
  } as any)

const ProtectedWorkspaceNamespacePartIndexRoute =
  ProtectedWorkspaceNamespacePartIndexImport.update({
    path: '/part/',
    getParentRoute: () => ProtectedWorkspaceNamespaceRouteRoute,
  } as any)

const ProtectedWorkspaceNamespaceDashboardIndexRoute =
  ProtectedWorkspaceNamespaceDashboardIndexImport.update({
    path: '/dashboard/',
    getParentRoute: () => ProtectedWorkspaceNamespaceRouteRoute,
  } as any)

const ProtectedWorkspaceNamespaceVariationPartVariationIdRouteRoute =
  ProtectedWorkspaceNamespaceVariationPartVariationIdRouteImport.update({
    path: '/variation/$partVariationId',
    getParentRoute: () => ProtectedWorkspaceNamespaceRouteRoute,
  } as any)

const ProtectedWorkspaceNamespaceUnitUnitIdRouteRoute =
  ProtectedWorkspaceNamespaceUnitUnitIdRouteImport.update({
    path: '/$unitId',
    getParentRoute: () => ProtectedWorkspaceNamespaceUnitRouteRoute,
  } as any)

const ProtectedWorkspaceNamespaceTestTestIdRouteRoute =
  ProtectedWorkspaceNamespaceTestTestIdRouteImport.update({
    path: '/test/$testId',
    getParentRoute: () => ProtectedWorkspaceNamespaceRouteRoute,
  } as any)

const ProtectedWorkspaceNamespaceStationStationIdRouteRoute =
  ProtectedWorkspaceNamespaceStationStationIdRouteImport.update({
    path: '/$stationId',
    getParentRoute: () => ProtectedWorkspaceNamespaceStationRouteRoute,
  } as any)

const ProtectedWorkspaceNamespaceProjectProjectIdRouteRoute =
  ProtectedWorkspaceNamespaceProjectProjectIdRouteImport.update({
    path: '/$projectId',
    getParentRoute: () => ProtectedWorkspaceNamespaceProjectRouteRoute,
  } as any)

const ProtectedWorkspaceNamespacePartPartIdRouteRoute =
  ProtectedWorkspaceNamespacePartPartIdRouteImport.update({
    path: '/part/$partId',
    getParentRoute: () => ProtectedWorkspaceNamespaceRouteRoute,
  } as any)

const ProtectedWorkspaceNamespaceVariationPartVariationIdIndexRoute =
  ProtectedWorkspaceNamespaceVariationPartVariationIdIndexImport.update({
    path: '/',
    getParentRoute: () =>
      ProtectedWorkspaceNamespaceVariationPartVariationIdRouteRoute,
  } as any)

const ProtectedWorkspaceNamespaceUnitUnitIdIndexRoute =
  ProtectedWorkspaceNamespaceUnitUnitIdIndexImport.update({
    path: '/',
    getParentRoute: () => ProtectedWorkspaceNamespaceUnitUnitIdRouteRoute,
  } as any)

const ProtectedWorkspaceNamespaceTestTestIdIndexRoute =
  ProtectedWorkspaceNamespaceTestTestIdIndexImport.update({
    path: '/',
    getParentRoute: () => ProtectedWorkspaceNamespaceTestTestIdRouteRoute,
  } as any)

const ProtectedWorkspaceNamespaceStationStationIdIndexRoute =
  ProtectedWorkspaceNamespaceStationStationIdIndexImport.update({
    path: '/',
    getParentRoute: () => ProtectedWorkspaceNamespaceStationStationIdRouteRoute,
  } as any)

const ProtectedWorkspaceNamespaceSessionSessionIdIndexRoute =
  ProtectedWorkspaceNamespaceSessionSessionIdIndexImport.update({
    path: '/session/$sessionId/',
    getParentRoute: () => ProtectedWorkspaceNamespaceRouteRoute,
  } as any)

const ProtectedWorkspaceNamespaceProjectProjectIdIndexRoute =
  ProtectedWorkspaceNamespaceProjectProjectIdIndexImport.update({
    path: '/',
    getParentRoute: () => ProtectedWorkspaceNamespaceProjectProjectIdRouteRoute,
  } as any)

const ProtectedWorkspaceNamespacePartPartIdIndexRoute =
  ProtectedWorkspaceNamespacePartPartIdIndexImport.update({
    path: '/',
    getParentRoute: () => ProtectedWorkspaceNamespacePartPartIdRouteRoute,
  } as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/_protected': {
      preLoaderRoute: typeof ProtectedImport
      parentRoute: typeof rootRoute
    }
    '/_public': {
      preLoaderRoute: typeof PublicImport
      parentRoute: typeof rootRoute
    }
    '/_protected/setup': {
      preLoaderRoute: typeof ProtectedSetupImport
      parentRoute: typeof ProtectedImport
    }
    '/_public/login': {
      preLoaderRoute: typeof PublicLoginImport
      parentRoute: typeof PublicImport
    }
    '/_public/signup': {
      preLoaderRoute: typeof PublicSignupImport
      parentRoute: typeof PublicImport
    }
    '/_public/': {
      preLoaderRoute: typeof PublicIndexLazyImport
      parentRoute: typeof PublicImport
    }
    '/_protected/workspace/$namespace': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceRouteImport
      parentRoute: typeof ProtectedImport
    }
    '/_protected/profile/': {
      preLoaderRoute: typeof ProtectedProfileIndexImport
      parentRoute: typeof ProtectedImport
    }
    '/_protected/workspace/': {
      preLoaderRoute: typeof ProtectedWorkspaceIndexImport
      parentRoute: typeof ProtectedImport
    }
    '/_protected/workspace/$namespace/project': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceProjectRouteImport
      parentRoute: typeof ProtectedWorkspaceNamespaceRouteImport
    }
    '/_protected/workspace/$namespace/settings': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceSettingsRouteImport
      parentRoute: typeof ProtectedWorkspaceNamespaceRouteImport
    }
    '/_protected/workspace/$namespace/station': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceStationRouteImport
      parentRoute: typeof ProtectedWorkspaceNamespaceRouteImport
    }
    '/_protected/workspace/$namespace/unit': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceUnitRouteImport
      parentRoute: typeof ProtectedWorkspaceNamespaceRouteImport
    }
    '/_protected/workspace/$namespace/': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceIndexImport
      parentRoute: typeof ProtectedWorkspaceNamespaceRouteImport
    }
    '/_protected/workspace/$namespace/part/$partId': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespacePartPartIdRouteImport
      parentRoute: typeof ProtectedWorkspaceNamespaceRouteImport
    }
    '/_protected/workspace/$namespace/project/$projectId': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceProjectProjectIdRouteImport
      parentRoute: typeof ProtectedWorkspaceNamespaceProjectRouteImport
    }
    '/_protected/workspace/$namespace/station/$stationId': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceStationStationIdRouteImport
      parentRoute: typeof ProtectedWorkspaceNamespaceStationRouteImport
    }
    '/_protected/workspace/$namespace/test/$testId': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceTestTestIdRouteImport
      parentRoute: typeof ProtectedWorkspaceNamespaceRouteImport
    }
    '/_protected/workspace/$namespace/unit/$unitId': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceUnitUnitIdRouteImport
      parentRoute: typeof ProtectedWorkspaceNamespaceUnitRouteImport
    }
    '/_protected/workspace/$namespace/variation/$partVariationId': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceVariationPartVariationIdRouteImport
      parentRoute: typeof ProtectedWorkspaceNamespaceRouteImport
    }
    '/_protected/workspace/$namespace/dashboard/': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceDashboardIndexImport
      parentRoute: typeof ProtectedWorkspaceNamespaceRouteImport
    }
    '/_protected/workspace/$namespace/part/': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespacePartIndexImport
      parentRoute: typeof ProtectedWorkspaceNamespaceRouteImport
    }
    '/_protected/workspace/$namespace/project/': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceProjectIndexImport
      parentRoute: typeof ProtectedWorkspaceNamespaceProjectRouteImport
    }
    '/_protected/workspace/$namespace/settings/': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceSettingsIndexImport
      parentRoute: typeof ProtectedWorkspaceNamespaceSettingsRouteImport
    }
    '/_protected/workspace/$namespace/part/$partId/': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespacePartPartIdIndexImport
      parentRoute: typeof ProtectedWorkspaceNamespacePartPartIdRouteImport
    }
    '/_protected/workspace/$namespace/project/$projectId/': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceProjectProjectIdIndexImport
      parentRoute: typeof ProtectedWorkspaceNamespaceProjectProjectIdRouteImport
    }
    '/_protected/workspace/$namespace/session/$sessionId/': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceSessionSessionIdIndexImport
      parentRoute: typeof ProtectedWorkspaceNamespaceRouteImport
    }
    '/_protected/workspace/$namespace/station/$stationId/': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceStationStationIdIndexImport
      parentRoute: typeof ProtectedWorkspaceNamespaceStationStationIdRouteImport
    }
    '/_protected/workspace/$namespace/test/$testId/': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceTestTestIdIndexImport
      parentRoute: typeof ProtectedWorkspaceNamespaceTestTestIdRouteImport
    }
    '/_protected/workspace/$namespace/unit/$unitId/': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceUnitUnitIdIndexImport
      parentRoute: typeof ProtectedWorkspaceNamespaceUnitUnitIdRouteImport
    }
    '/_protected/workspace/$namespace/variation/$partVariationId/': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceVariationPartVariationIdIndexImport
      parentRoute: typeof ProtectedWorkspaceNamespaceVariationPartVariationIdRouteImport
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren([
  ProtectedRoute.addChildren([
    ProtectedSetupRoute,
    ProtectedWorkspaceNamespaceRouteRoute.addChildren([
      ProtectedWorkspaceNamespaceProjectRouteRoute.addChildren([
        ProtectedWorkspaceNamespaceProjectProjectIdRouteRoute.addChildren([
          ProtectedWorkspaceNamespaceProjectProjectIdIndexRoute,
        ]),
        ProtectedWorkspaceNamespaceProjectIndexRoute,
      ]),
      ProtectedWorkspaceNamespaceSettingsRouteRoute.addChildren([
        ProtectedWorkspaceNamespaceSettingsIndexRoute,
      ]),
      ProtectedWorkspaceNamespaceStationRouteRoute.addChildren([
        ProtectedWorkspaceNamespaceStationStationIdRouteRoute.addChildren([
          ProtectedWorkspaceNamespaceStationStationIdIndexRoute,
        ]),
      ]),
      ProtectedWorkspaceNamespaceUnitRouteRoute.addChildren([
        ProtectedWorkspaceNamespaceUnitUnitIdRouteRoute.addChildren([
          ProtectedWorkspaceNamespaceUnitUnitIdIndexRoute,
        ]),
      ]),
      ProtectedWorkspaceNamespaceIndexRoute,
      ProtectedWorkspaceNamespacePartPartIdRouteRoute.addChildren([
        ProtectedWorkspaceNamespacePartPartIdIndexRoute,
      ]),
      ProtectedWorkspaceNamespaceTestTestIdRouteRoute.addChildren([
        ProtectedWorkspaceNamespaceTestTestIdIndexRoute,
      ]),
      ProtectedWorkspaceNamespaceVariationPartVariationIdRouteRoute.addChildren(
        [ProtectedWorkspaceNamespaceVariationPartVariationIdIndexRoute],
      ),
      ProtectedWorkspaceNamespaceDashboardIndexRoute,
      ProtectedWorkspaceNamespacePartIndexRoute,
      ProtectedWorkspaceNamespaceSessionSessionIdIndexRoute,
    ]),
    ProtectedProfileIndexRoute,
    ProtectedWorkspaceIndexRoute,
  ]),
  PublicRoute.addChildren([
    PublicLoginRoute,
    PublicSignupRoute,
    PublicIndexLazyRoute,
  ]),
])

/* prettier-ignore-end */
