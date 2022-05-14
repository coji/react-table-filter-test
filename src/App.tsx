import { useState } from 'react'
import { Box, Stack, Heading } from '@chakra-ui/react'
import { SearchInput } from './SearchInput'
import { DataTable } from './DataTable'
import type { Person } from './model'
import makeData from './makeData'

const persons: Person[] = makeData(1000)

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

        <DataTable persons={persons} globalFilter={searchQuery} />
      </Stack>
    </>
  )
}
export default App
