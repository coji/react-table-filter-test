import { useState, useMemo, memo } from 'react'
import {
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react'
import {
  useTableInstance,
  createTable,
  getCoreRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table'
import type { Person } from './model'

const table = createTable().setRowType<Person>()

interface DataTableProps {
  persons: Person[]
  globalFilter: string
}
export const DataTable = memo(function DataTable(props: DataTableProps) {
  const [data] = useState([...props.persons])
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
      globalFilter: props.globalFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  console.log('render: ', props, instance.getFilteredRowModel().flatRows.length)

  return (
    <TableContainer>
      <Table size="sm">
        <Thead>
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
          {instance.getFilteredRowModel().flatRows.map((row) => (
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
