import React from "react"
const ComponentContext = React.createContext({})

export const ComponentContextConsumer = ComponentContext.Consumer
export const ComponentContextProvider = ComponentContext.Provider
export default ComponentContext
