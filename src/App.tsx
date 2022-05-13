import { useState, useEffect, useMemo, memo } from 'react'
import {
  Box,
  Stack,
  Heading,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainerProps,
  Input,
} from '@chakra-ui/react'
import {
  useTableInstance,
  createTable,
  getCoreRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table'
import makeData from './makeData'

interface Person {
  category: string
  company: string
  dept: string
  name: string
  email: string
  note: string
}
const persons: Person[] = makeData(1000)
const table = createTable().setRowType<Person>()

const App = () => {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <>
      <Stack maxH="full">
        <Heading
          p="2"
          fontSize="md"
          bg="gray.100"
          rounded="md"
          display="flex"
          gap="4"
          alignItems="center"
        >
          <Box whiteSpace="nowrap" flex="1" color="gray.600">
            {persons.length} Persons
          </Box>

          <SearchInput onChange={setSearchQuery} />
        </Heading>

        <DataTable flex="1" globalFilter={searchQuery} />
      </Stack>
    </>
  )
}
export default App

interface DataTableProps extends TableContainerProps {
  globalFilter: string
  onSelectRow?: (x: number, y: number, row: Person | null) => void
}
const DataTable = memo(function DataTable({
  globalFilter,
  ...rest
}: DataTableProps) {
  const [data] = useState([...persons])
  const columns = useMemo(
    () => [
      table.createDataColumn('category', {}),
      table.createDataColumn('company', {}),
      table.createDataColumn('dept', {}),
      table.createDataColumn('name', {}),
      table.createDataColumn('email', {}),
      table.createDataColumn('note', {}),
    ],
    []
  )

  const instance = useTableInstance(table, {
    data,
    columns,
    state: {
      globalFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <TableContainer overflowY="scroll" {...rest}>
      <Table position="relative" size="sm">
        <Thead bg="white" position="sticky" zIndex="sticky" top="0">
          {instance.getHeaderGroups().map((headerGroup) => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Th key={header.id}>
                  {header.isPlaceholder ? null : header.renderHeader()}
                </Th>
              ))}
            </Tr>
          ))}
        </Thead>
        <Tbody>
          {instance.getFilteredRowModel().rows.map((row) => (
            <Tr key={row.id} _hover={{ bg: 'gray.50', cursor: 'pointer' }}>
              {row.getVisibleCells().map((cell) => (
                <Td key={cell.id}>{cell.renderCell()}</Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  )
})

// debounced search input
interface SearchInputProp {
  value?: string
  onChange: (value: string) => void
}
export const SearchInput: React.FC<SearchInputProp> = ({
  value: initialValue = '',
  onChange,
}) => {
  const [isFocus, setIsFocus] = useState(false)
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, 100)
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
