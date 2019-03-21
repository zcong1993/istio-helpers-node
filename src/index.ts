import { Metadata, MetadataValue } from 'grpc'
import { IncomingHttpHeaders } from 'http'

export const tracingKeys = [
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
  passthrough: boolean
): Metadata => {
  if (passthrough) {
    return callMeta
  }
  const tracingMetadata = new Metadata()
  tracingKeys.forEach(key => {
    const val = callMeta.get(key)
    if (val.length > 0) {
      const [first, ...rest] = val
      tracingMetadata.set(key, first)
      rest.map((val: string) => tracingMetadata.add(key, val))
    }
  })
  return tracingMetadata
}

export const http2grpc = (headers: IncomingHttpHeaders): Metadata => {
  const tracingMetadata = new Metadata()
  tracingKeys.forEach(key => {
    const val: string | string[] = headers[key]
    if (typeof val === 'string') {
      tracingMetadata.set(key, val)
      return
    }
    if (Array.isArray(val) && val.length > 0) {
      const [first, ...rest] = val
      tracingMetadata.set(key, first)
      rest.map(val => tracingMetadata.add(key, val))
    }
  })
  return tracingMetadata
}

export const grpc2http = (callMeta: Metadata): IncomingHttpHeaders => {
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
