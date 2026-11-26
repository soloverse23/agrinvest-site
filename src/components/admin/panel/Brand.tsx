import React from 'react'

import { LogoMark } from '@ds/brand/LogoMark'

/** The panel's logo on the login screen: the mark and the name. */
export function PanelLogo() {
  return (
    <span className="panel-logo">
      <LogoMark title="" className="panel-logo__mark" />
      <span className="panel-logo__name">
        Agrinvest <span className="panel-logo__sub">panou</span>
      </span>
    </span>
  )
}

/** The small mark in the navigation. */
export function PanelIcon() {
  return <LogoMark title="Agrinvest" className="panel-icon" />
}
