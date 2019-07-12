import { Metadata, MetadataValue } from 'grpc'
import { IncomingHttpHeaders } from 'http'

export const defaultTracingKeys = [
  'x-request-id',
  'x-b3-traceid',
  'x-b3-spanid',
  'x-b3-parentspanid',
  'x-b3-sampled',
  'x-b3-flags',
  'x-ot-span-context'
]

export const grpc2grpc = (
  callMeta: Metadata,
  tracingKeys: string[] = defaultTracingKeys,
  passthrough: boolean = false
): Metadata => {
  if (passthrough) {
    return callMeta.clone()
  }
  const tracingMetadata = new Metadata()
  tracingKeys.forEach(key => {
    const val = callMeta.get(key)
    if (val.length > 0) {
      val.map(vv => tracingMetadata.add(key, vv))
    }
  })
  return tracingMetadata
}

export const http2grpc = (
  headers: IncomingHttpHeaders,
  tracingKeys: string[] = defaultTracingKeys
): Metadata => {
  const tracingMetadata = new Metadata()
  tracingKeys.forEach(key => {
    const val: string | string[] = headers[key]
    if (typeof val === 'string') {
      tracingMetadata.set(key, val)
      return
    }
    if (Array.isArray(val) && val.length > 0) {
      val.map(vv => tracingMetadata.add(key, vv))
    }
  })
  return tracingMetadata
}

export const grpc2http = (
  callMeta: Metadata,
  tracingKeys: string[] = defaultTracingKeys
): IncomingHttpHeaders => {
  const headers: IncomingHttpHeaders = {}
  tracingKeys.forEach(key => {
    const val = callMeta.get(key)
    if (val.length > 0) {
      val
        .filter((vv: MetadataValue) => typeof vv === 'string')
        .forEach((vvv: string) => {
          if (!headers[key]) {
            headers[key] = [vvv]
          } else {
            headers[key] = [...headers[key], vvv]
          }
        })
    }
  })
  return headers
}

export const http2http = (
  headers: IncomingHttpHeaders,
  tracingKeys: string[] = defaultTracingKeys
): IncomingHttpHeaders => {
  const tracingHeaders: IncomingHttpHeaders = {}
  tracingKeys.forEach(key => {
    const val: string | string[] = headers[key]
    if (val && val.length > 0) {
      tracingHeaders[key] = val
    }
  })

  return tracingHeaders
}
