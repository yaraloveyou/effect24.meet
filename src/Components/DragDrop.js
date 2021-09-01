import React, { useState } from 'react'

const DragDrop = (props) => {
    const [bgColor, setBgColor] = useState('transparent')

    const changeBgCololr = (state) => {
        // eslint-disable-next-line
        setBgColor(state && 'gray' || 'transparent')
    }

    return (
        <div style={{
            background: bgColor
        }} className={props.className}
            onDragEnter={(e) => {
                e.preventDefault()
                e.stopPropagation()
                changeBgCololr(true)
                e.dataTransfer.dropEffect = 'copy'
            }}
            onDragLeave={(e) => {
                e.preventDefault()
                e.stopPropagation()
                changeBgCololr(false)
            }}
            onDragOver={(e) => {
                e.preventDefault()
                e.stopPropagation()
            }}
            onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                changeBgCololr(false)
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    props.sendFiles(e.dataTransfer.files)
                }
            }}
        >
            { props.children }
        </div>
    )
}

export default DragDrop