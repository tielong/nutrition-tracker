import { useRef, useState } from 'react'
import type { AppState } from '../types'
import { exportState, importState, defaultState } from '../storage'

interface Props {
  state: AppState
  setState: (s: AppState) => void
}

export function Settings({ state, setState }: Props) {
  const [name, setName] = useState(state.baby.name)
  const [birthdate, setBirthdate] = useState(state.baby.birthdate)
  const [msg, setMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function saveProfile() {
    setState({ ...state, baby: { name: name.trim() || '宝宝', birthdate } })
    setMsg('资料已保存。')
    setTimeout(() => setMsg(''), 2000)
  }

  function doExport() {
    const blob = new Blob([exportState(state)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nutrition-tracker-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function doImport(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const next = importState(String(reader.result))
        setState(next)
        setName(next.baby.name)
        setBirthdate(next.baby.birthdate)
        setMsg('数据已导入。')
      } catch {
        setMsg('导入失败 — 不是有效的备份文件。')
      }
      setTimeout(() => setMsg(''), 3000)
    }
    reader.readAsText(file)
  }

  return (
    <>
      <div className="card">
        <h2>宝宝资料</h2>
        <div className="row">
          <div>
            <label>昵称</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label>出生日期（用于显示月龄）</label>
            <input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
            />
          </div>
        </div>
        <div className="actions">
          <button className="primary" onClick={saveProfile}>
            保存资料
          </button>
        </div>
      </div>

      <div className="card">
        <h2>备份与恢复</h2>
        <p className="small muted" style={{ marginTop: -6 }}>
          数据仅保存在本浏览器中。可导出 JSON 备份以妥善保存，或迁移到其他设备。
        </p>
        <div className="actions" style={{ justifyContent: 'flex-start' }}>
          <button className="ghost" onClick={doExport}>
            导出备份
          </button>
          <button className="ghost" onClick={() => fileRef.current?.click()}>
            导入备份
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) doImport(f)
              e.target.value = ''
            }}
          />
        </div>
      </div>

      <div className="card">
        <h2>重置</h2>
        <button
          className="ghost"
          style={{ color: '#ef4444', borderColor: '#ef4444' }}
          onClick={() => {
            if (
              confirm('清空所有记录并恢复默认？如不确定请先导出备份。')
            ) {
              const fresh = defaultState()
              setState(fresh)
              setName(fresh.baby.name)
              setBirthdate(fresh.baby.birthdate)
            }
          }}
        >
          清空所有数据
        </button>
      </div>

      {msg && (
        <p className="small" style={{ color: 'var(--accent)' }}>
          {msg}
        </p>
      )}
    </>
  )
}
