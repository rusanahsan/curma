import React, {useContext} from 'react'
const AppContext = React.createContext()

const AppProvider = ({ children }) => {
    const obj={
        server:'',//'http://localhost:5000',
        key:`p08yX5PAYwvCu5AIPoqfkYwe1EyB2IMA`
    }
    return (
    <AppContext.Provider value={obj}>
        {children}
    </AppContext.Provider>
    )
}
// make sure use
const useGlobalContext = () => {
    return useContext(AppContext)
}

export { useGlobalContext, AppProvider }
