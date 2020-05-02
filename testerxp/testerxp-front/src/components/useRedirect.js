import React from 'react';
import { useEffect } from 'react'
import { useHistory } from 'react-router-dom'

const useRedirect = (from) => {

    const history = useHistory()
    useEffect(() => {
            history.push({
                pathname: '/executions',
                state: {from}
            })

    }, [])
}

export default useRedirect