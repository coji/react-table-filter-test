import { useState, useEffect, memo } from 'react'
import { Input } from '@chakra-ui/react'

// debounced search input
interface SearchInputProp {
  value?: string
  onChange: (value: string) => void
}
export const SearchInput: React.FC<SearchInputProp> = memo(
  ({ value: initialValue = '', onChange }) => {
    const [isFocus, setIsFocus] = useState(false)
    const [value, setValue] = useState(initialValue)

    useEffect(() => {
      setValue(initialValue)
    }, [initialValue])

    useEffect(() => {
      const timeout = setTimeout(() => onChange(value), 200)
      return () => clearTimeout(timeout)
    }, [value, onChange])

    return (
      <Input
        bg="white"
        type="search"
        placeholder="Search"
        _placeholder={{ color: 'gray.400' }}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setValue(e.target.value)
        }
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
      ></Input>
    )
  }
)
