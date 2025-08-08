"use client"
import { useMemo, useState } from 'react'
import { ToolLayout } from '../../components/tools/ToolLayout'
import { Input } from '../../components/ui/input'

function calculateIPv4(cidr: string) {
  const [ip, prefixStr] = cidr.split('/') as [string | undefined, string | undefined]
  const prefix = Number(prefixStr)
  if (!ip) return null
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255) || !(prefix >= 0 && prefix <= 32)) return null
  const ipNum = parts.reduce((acc, p) => (acc << 8) + p, 0) >>> 0
  const mask = (prefix === 0 ? 0 : 0xffffffff << (32 - prefix)) >>> 0
  const network = ipNum & mask
  const broadcast = network | (~mask >>> 0)
  const firstHost = prefix === 32 ? network : network + 1
  const lastHost = prefix >= 31 ? network : broadcast - 1
  const hosts = prefix >= 31 ? 1 : Math.max(0, lastHost - firstHost + 1)
  const numToIp = (n: number) => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join('.')
  return {
    network: numToIp(network),
    mask: numToIp(mask),
    broadcast: numToIp(broadcast),
    firstHost: numToIp(firstHost >>> 0),
    lastHost: numToIp(lastHost >>> 0),
    hosts,
  }
}

export default function SubnetCalculatorPage() {
  const [cidr, setCidr] = useState('192.168.1.10/24')
  const result = useMemo(() => calculateIPv4(cidr), [cidr])

  return (
    <ToolLayout title="IP Subnet Calculator" description="Calculate network details for IPv4 CIDR.">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-muted-foreground">IPv4 CIDR</label>
          <Input value={cidr} onChange={(e) => setCidr(e.target.value)} placeholder="e.g. 10.0.0.1/24" />
        </div>
        <div className="rounded-md border p-3 text-sm">
          {!result ? (
            <p className="text-destructive">Invalid CIDR</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div>Network</div><div className="font-mono">{result.network}</div>
              <div>Mask</div><div className="font-mono">{result.mask}</div>
              <div>Broadcast</div><div className="font-mono">{result.broadcast}</div>
              <div>First host</div><div className="font-mono">{result.firstHost}</div>
              <div>Last host</div><div className="font-mono">{result.lastHost}</div>
              <div>Hosts</div><div className="font-mono">{result.hosts}</div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}

