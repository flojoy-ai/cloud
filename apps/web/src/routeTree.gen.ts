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
import { Route as ProtectedWorkspaceNamespaceStationRouteImport } from './routes/_protected/workspace/$namespace/station/route'
import { Route as ProtectedWorkspaceNamespaceSettingsRouteImport } from './routes/_protected/workspace/$namespace/settings/route'
import { Route as ProtectedWorkspaceNamespaceProjectRouteImport } from './routes/_protected/workspace/$namespace/project/route'
import { Route as ProtectedWorkspaceNamespaceSettingsIndexImport } from './routes/_protected/workspace/$namespace/settings/index'
import { Route as ProtectedWorkspaceNamespaceProjectIndexImport } from './routes/_protected/workspace/$namespace/project/index'
import { Route as ProtectedWorkspaceNamespaceFamilyIndexImport } from './routes/_protected/workspace/$namespace/family/index'
import { Route as ProtectedWorkspaceNamespaceStationStationIdRouteImport } from './routes/_protected/workspace/$namespace/station/$stationId/route'
import { Route as ProtectedWorkspaceNamespaceProjectProjectIdRouteImport } from './routes/_protected/workspace/$namespace/project/$projectId/route'
import { Route as ProtectedWorkspaceNamespaceModelModelIdRouteImport } from './routes/_protected/workspace/$namespace/model/$modelId/route'
import { Route as ProtectedWorkspaceNamespaceFamilyFamilyIdRouteImport } from './routes/_protected/workspace/$namespace/family/$familyId/route'
import { Route as ProtectedWorkspaceNamespaceStationStationIdIndexImport } from './routes/_protected/workspace/$namespace/station/$stationId/index'
import { Route as ProtectedWorkspaceNamespaceProjectProjectIdIndexImport } from './routes/_protected/workspace/$namespace/project/$projectId/index'
import { Route as ProtectedWorkspaceNamespaceModelModelIdIndexImport } from './routes/_protected/workspace/$namespace/model/$modelId/index'
import { Route as ProtectedWorkspaceNamespaceHardwareHardwareIdIndexImport } from './routes/_protected/workspace/$namespace/hardware/$hardwareId/index'
import { Route as ProtectedWorkspaceNamespaceFamilyFamilyIdIndexImport } from './routes/_protected/workspace/$namespace/family/$familyId/index'
import { Route as ProtectedWorkspaceNamespaceProjectProjectIdStationStationIdSessionSessionIdRouteImport } from './routes/_protected/workspace/$namespace/project/$projectId/station/$stationId/session/$sessionId/route'
import { Route as ProtectedWorkspaceNamespaceProjectProjectIdStationStationIdSessionSessionIdIndexImport } from './routes/_protected/workspace/$namespace/project/$projectId/station/$stationId/session/$sessionId/index'

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

const ProtectedWorkspaceNamespaceFamilyIndexRoute =
  ProtectedWorkspaceNamespaceFamilyIndexImport.update({
    path: '/family/',
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

const ProtectedWorkspaceNamespaceModelModelIdRouteRoute =
  ProtectedWorkspaceNamespaceModelModelIdRouteImport.update({
    path: '/model/$modelId',
    getParentRoute: () => ProtectedWorkspaceNamespaceRouteRoute,
  } as any)

const ProtectedWorkspaceNamespaceFamilyFamilyIdRouteRoute =
  ProtectedWorkspaceNamespaceFamilyFamilyIdRouteImport.update({
    path: '/family/$familyId',
    getParentRoute: () => ProtectedWorkspaceNamespaceRouteRoute,
  } as any)

const ProtectedWorkspaceNamespaceStationStationIdIndexRoute =
  ProtectedWorkspaceNamespaceStationStationIdIndexImport.update({
    path: '/',
    getParentRoute: () => ProtectedWorkspaceNamespaceStationStationIdRouteRoute,
  } as any)

const ProtectedWorkspaceNamespaceProjectProjectIdIndexRoute =
  ProtectedWorkspaceNamespaceProjectProjectIdIndexImport.update({
    path: '/',
    getParentRoute: () => ProtectedWorkspaceNamespaceProjectProjectIdRouteRoute,
  } as any)

const ProtectedWorkspaceNamespaceModelModelIdIndexRoute =
  ProtectedWorkspaceNamespaceModelModelIdIndexImport.update({
    path: '/',
    getParentRoute: () => ProtectedWorkspaceNamespaceModelModelIdRouteRoute,
  } as any)

const ProtectedWorkspaceNamespaceHardwareHardwareIdIndexRoute =
  ProtectedWorkspaceNamespaceHardwareHardwareIdIndexImport.update({
    path: '/hardware/$hardwareId/',
    getParentRoute: () => ProtectedWorkspaceNamespaceRouteRoute,
  } as any)

const ProtectedWorkspaceNamespaceFamilyFamilyIdIndexRoute =
  ProtectedWorkspaceNamespaceFamilyFamilyIdIndexImport.update({
    path: '/',
    getParentRoute: () => ProtectedWorkspaceNamespaceFamilyFamilyIdRouteRoute,
  } as any)

const ProtectedWorkspaceNamespaceProjectProjectIdStationStationIdSessionSessionIdRouteRoute =
  ProtectedWorkspaceNamespaceProjectProjectIdStationStationIdSessionSessionIdRouteImport.update(
    {
      path: '/station/$stationId/session/$sessionId',
      getParentRoute: () =>
        ProtectedWorkspaceNamespaceProjectProjectIdRouteRoute,
    } as any,
  )

const ProtectedWorkspaceNamespaceProjectProjectIdStationStationIdSessionSessionIdIndexRoute =
  ProtectedWorkspaceNamespaceProjectProjectIdStationStationIdSessionSessionIdIndexImport.update(
    {
      path: '/',
      getParentRoute: () =>
        ProtectedWorkspaceNamespaceProjectProjectIdStationStationIdSessionSessionIdRouteRoute,
    } as any,
  )

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
    '/_protected/workspace/$namespace/': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceIndexImport
      parentRoute: typeof ProtectedWorkspaceNamespaceRouteImport
    }
    '/_protected/workspace/$namespace/family/$familyId': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceFamilyFamilyIdRouteImport
      parentRoute: typeof ProtectedWorkspaceNamespaceRouteImport
    }
    '/_protected/workspace/$namespace/model/$modelId': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceModelModelIdRouteImport
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
    '/_protected/workspace/$namespace/family/': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceFamilyIndexImport
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
    '/_protected/workspace/$namespace/family/$familyId/': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceFamilyFamilyIdIndexImport
      parentRoute: typeof ProtectedWorkspaceNamespaceFamilyFamilyIdRouteImport
    }
    '/_protected/workspace/$namespace/hardware/$hardwareId/': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceHardwareHardwareIdIndexImport
      parentRoute: typeof ProtectedWorkspaceNamespaceRouteImport
    }
    '/_protected/workspace/$namespace/model/$modelId/': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceModelModelIdIndexImport
      parentRoute: typeof ProtectedWorkspaceNamespaceModelModelIdRouteImport
    }
    '/_protected/workspace/$namespace/project/$projectId/': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceProjectProjectIdIndexImport
      parentRoute: typeof ProtectedWorkspaceNamespaceProjectProjectIdRouteImport
    }
    '/_protected/workspace/$namespace/station/$stationId/': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceStationStationIdIndexImport
      parentRoute: typeof ProtectedWorkspaceNamespaceStationStationIdRouteImport
    }
    '/_protected/workspace/$namespace/project/$projectId/station/$stationId/session/$sessionId': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceProjectProjectIdStationStationIdSessionSessionIdRouteImport
      parentRoute: typeof ProtectedWorkspaceNamespaceProjectProjectIdRouteImport
    }
    '/_protected/workspace/$namespace/project/$projectId/station/$stationId/session/$sessionId/': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceProjectProjectIdStationStationIdSessionSessionIdIndexImport
      parentRoute: typeof ProtectedWorkspaceNamespaceProjectProjectIdStationStationIdSessionSessionIdRouteImport
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
          ProtectedWorkspaceNamespaceProjectProjectIdStationStationIdSessionSessionIdRouteRoute.addChildren(
            [
              ProtectedWorkspaceNamespaceProjectProjectIdStationStationIdSessionSessionIdIndexRoute,
            ],
          ),
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
      ProtectedWorkspaceNamespaceIndexRoute,
      ProtectedWorkspaceNamespaceFamilyFamilyIdRouteRoute.addChildren([
        ProtectedWorkspaceNamespaceFamilyFamilyIdIndexRoute,
      ]),
      ProtectedWorkspaceNamespaceModelModelIdRouteRoute.addChildren([
        ProtectedWorkspaceNamespaceModelModelIdIndexRoute,
      ]),
      ProtectedWorkspaceNamespaceFamilyIndexRoute,
      ProtectedWorkspaceNamespaceHardwareHardwareIdIndexRoute,
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
