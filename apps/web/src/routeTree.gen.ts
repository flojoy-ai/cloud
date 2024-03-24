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
import { Route as ProtectedSetupImport } from './routes/_protected/setup'
import { Route as ProtectedWorkspaceIndexImport } from './routes/_protected/workspace/index'
import { Route as ProtectedProfileIndexImport } from './routes/_protected/profile/index'
import { Route as ProtectedWorkspaceNamespaceRouteImport } from './routes/_protected/workspace/$namespace/route'
import { Route as ProtectedWorkspaceNamespaceIndexImport } from './routes/_protected/workspace/$namespace/index'
import { Route as ProtectedWorkspaceNamespaceProjectRouteImport } from './routes/_protected/workspace/$namespace/project/route'
import { Route as ProtectedWorkspaceNamespaceSettingsIndexImport } from './routes/_protected/workspace/$namespace/settings/index'
import { Route as ProtectedWorkspaceNamespaceProjectIndexImport } from './routes/_protected/workspace/$namespace/project/index'
import { Route as ProtectedWorkspaceNamespaceHardwareIndexImport } from './routes/_protected/workspace/$namespace/hardware/index'
import { Route as ProtectedWorkspaceNamespaceProjectProjectIdIndexImport } from './routes/_protected/workspace/$namespace/project/$projectId/index'
import { Route as ProtectedWorkspaceNamespaceHardwareFamilyIdIndexImport } from './routes/_protected/workspace/$namespace/hardware/$familyId/index'
import { Route as ProtectedWorkspaceNamespaceProjectProjectIdStationStationIdIndexImport } from './routes/_protected/workspace/$namespace/project/$projectId/station/$stationId/index'

// Create Virtual Routes

const PublicIndexLazyImport = createFileRoute('/_public/')()
const PublicSignupLazyImport = createFileRoute('/_public/signup')()
const PublicLoginLazyImport = createFileRoute('/_public/login')()

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

const PublicSignupLazyRoute = PublicSignupLazyImport.update({
  path: '/signup',
  getParentRoute: () => PublicRoute,
} as any).lazy(() =>
  import('./routes/_public/signup.lazy').then((d) => d.Route),
)

const PublicLoginLazyRoute = PublicLoginLazyImport.update({
  path: '/login',
  getParentRoute: () => PublicRoute,
} as any).lazy(() => import('./routes/_public/login.lazy').then((d) => d.Route))

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

const ProtectedWorkspaceNamespaceProjectRouteRoute =
  ProtectedWorkspaceNamespaceProjectRouteImport.update({
    path: '/project',
    getParentRoute: () => ProtectedWorkspaceNamespaceRouteRoute,
  } as any)

const ProtectedWorkspaceNamespaceSettingsIndexRoute =
  ProtectedWorkspaceNamespaceSettingsIndexImport.update({
    path: '/settings/',
    getParentRoute: () => ProtectedWorkspaceNamespaceRouteRoute,
  } as any)

const ProtectedWorkspaceNamespaceProjectIndexRoute =
  ProtectedWorkspaceNamespaceProjectIndexImport.update({
    path: '/',
    getParentRoute: () => ProtectedWorkspaceNamespaceProjectRouteRoute,
  } as any)

const ProtectedWorkspaceNamespaceHardwareIndexRoute =
  ProtectedWorkspaceNamespaceHardwareIndexImport.update({
    path: '/hardware/',
    getParentRoute: () => ProtectedWorkspaceNamespaceRouteRoute,
  } as any)

const ProtectedWorkspaceNamespaceProjectProjectIdIndexRoute =
  ProtectedWorkspaceNamespaceProjectProjectIdIndexImport.update({
    path: '/$projectId/',
    getParentRoute: () => ProtectedWorkspaceNamespaceProjectRouteRoute,
  } as any)

const ProtectedWorkspaceNamespaceHardwareFamilyIdIndexRoute =
  ProtectedWorkspaceNamespaceHardwareFamilyIdIndexImport.update({
    path: '/hardware/$familyId/',
    getParentRoute: () => ProtectedWorkspaceNamespaceRouteRoute,
  } as any)

const ProtectedWorkspaceNamespaceProjectProjectIdStationStationIdIndexRoute =
  ProtectedWorkspaceNamespaceProjectProjectIdStationStationIdIndexImport.update(
    {
      path: '/$projectId/station/$stationId/',
      getParentRoute: () => ProtectedWorkspaceNamespaceProjectRouteRoute,
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
      preLoaderRoute: typeof PublicLoginLazyImport
      parentRoute: typeof PublicImport
    }
    '/_public/signup': {
      preLoaderRoute: typeof PublicSignupLazyImport
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
    '/_protected/workspace/$namespace/': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceIndexImport
      parentRoute: typeof ProtectedWorkspaceNamespaceRouteImport
    }
    '/_protected/workspace/$namespace/hardware/': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceHardwareIndexImport
      parentRoute: typeof ProtectedWorkspaceNamespaceRouteImport
    }
    '/_protected/workspace/$namespace/project/': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceProjectIndexImport
      parentRoute: typeof ProtectedWorkspaceNamespaceProjectRouteImport
    }
    '/_protected/workspace/$namespace/settings/': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceSettingsIndexImport
      parentRoute: typeof ProtectedWorkspaceNamespaceRouteImport
    }
    '/_protected/workspace/$namespace/hardware/$familyId/': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceHardwareFamilyIdIndexImport
      parentRoute: typeof ProtectedWorkspaceNamespaceRouteImport
    }
    '/_protected/workspace/$namespace/project/$projectId/': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceProjectProjectIdIndexImport
      parentRoute: typeof ProtectedWorkspaceNamespaceProjectRouteImport
    }
    '/_protected/workspace/$namespace/project/$projectId/station/$stationId/': {
      preLoaderRoute: typeof ProtectedWorkspaceNamespaceProjectProjectIdStationStationIdIndexImport
      parentRoute: typeof ProtectedWorkspaceNamespaceProjectRouteImport
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren([
  ProtectedRoute.addChildren([
    ProtectedSetupRoute,
    ProtectedWorkspaceNamespaceRouteRoute.addChildren([
      ProtectedWorkspaceNamespaceProjectRouteRoute.addChildren([
        ProtectedWorkspaceNamespaceProjectIndexRoute,
        ProtectedWorkspaceNamespaceProjectProjectIdIndexRoute,
        ProtectedWorkspaceNamespaceProjectProjectIdStationStationIdIndexRoute,
      ]),
      ProtectedWorkspaceNamespaceIndexRoute,
      ProtectedWorkspaceNamespaceHardwareIndexRoute,
      ProtectedWorkspaceNamespaceSettingsIndexRoute,
      ProtectedWorkspaceNamespaceHardwareFamilyIdIndexRoute,
    ]),
    ProtectedProfileIndexRoute,
    ProtectedWorkspaceIndexRoute,
  ]),
  PublicRoute.addChildren([
    PublicLoginLazyRoute,
    PublicSignupLazyRoute,
    PublicIndexLazyRoute,
  ]),
])

/* prettier-ignore-end */
