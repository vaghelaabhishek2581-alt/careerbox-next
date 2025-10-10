import Header from '@/components/header'
import React from 'react'

const WebLayout = ({children}: {children: React.ReactNode   }) => {
  return (
    <div>
      <Header />
      <div className='pt-28'>

      {children}
      </div>
    </div>
  )
}

export default WebLayout