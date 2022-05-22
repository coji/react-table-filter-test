import { useState, useMemo, useRef, useCallback } from 'react'
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
import { useVirtual } from './hooks/useVirtual'

import type { Person } from './model'
import { useEffect } from 'react'

const table = createTable().setRowType<Person>()

interface DataTableProps {
  persons: Person[]
  globalFilter: string
  onRowsChanged?: (rows: number) => void
}

const DataTable = function DataTable(props: DataTableProps) {
  const [data] = useState([...props.persons])
  const columns = useMemo(
    () => [
      table.createDataColumn('category', {
        cell: (cell) => `${cell.row.index} ${cell.getValue()}`,
      }),
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

  const length = instance.getFilteredRowModel().rows.length
  useEffect(() => {
    if (props.onRowsChanged) {
      props.onRowsChanged(length)
    }
  }, [length])

  const bodyRef = useRef<HTMLTableSectionElement>(null!)

  const rowVirtualizer = useVirtual({
    size: length,
    parentRef: bodyRef,
  })

  const items = rowVirtualizer.virtualItems
  const paddingTop = items.length > 0 ? items[0].start : 0
  const paddingBottom =
    items.length > 0
      ? rowVirtualizer.totalSize - items[items.length - 1].end
      : 0

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
        <Tbody ref={bodyRef}>
          {paddingTop > 0 && (
            <Tr>
              <Td height={`${paddingTop}px`} />
            </Tr>
          )}

          {rowVirtualizer.virtualItems.map((virtualRow) => {
            const row = instance.getFilteredRowModel().rows[virtualRow.index]
            return (
              <Tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Td key={cell.id}>{cell.renderCell()}</Td>
                ))}
              </Tr>
            )
          })}

          {paddingBottom > 0 && (
            <Tr bgColor="red.50">
              <Td height={`${paddingBottom}px`} />
            </Tr>
          )}
        </Tbody>
      </Table>
    </TableContainer>
  )
}

DataTable.whyDidYouRender = true
export { DataTable }
