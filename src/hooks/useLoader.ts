import { atom, useAtom } from "jotai"
import React from "react"

export const loaderAtom = atom(false)

const useLoader = (_is_init_hidden?: boolean) => {
  const [loader, setLoader]: any = useAtom(loaderAtom)

  React.useEffect(() => {
    if (_is_init_hidden === undefined || _is_init_hidden === true) {
      setLoader(false)
    }
  }, [])

  return {
    loader,
    setLoader,
    loadingStr: "読み込み中",
  }
}

export default useLoader
