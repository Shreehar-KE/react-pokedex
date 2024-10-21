import { useEffect, useState } from "react"
import { getFullPokedexNumber, getPokedexNumber } from "../utils/";

export function PokeCard(props) {

  const { selectedPokemon } = props
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)



  useEffect(() => {
    if (loading || !localStorage) { return }

    let cache = {}
    if (localStorage.getItem('pokedex')) {
      cache = JSON.parse(localStorage.getItem('pokedex'))
    }

    if (selectedPokemon in cache) {
      setData(cache[selectedPokemon])
      return
    }

    async function fetchPokemonData() {
      setLoading(true)
      try {
        const baseUrl = 'https://pokeapi.co/api/v2/'
        const suffix = 'pokemon/' + getPokedexNumber(selectedPokemon)
        const finalUrl = baseUrl + suffix
        const res = await fetch(finalUrl)
        const pokemonData = await res.json()
        setData(pokemonData)
        console.log(pokemonData)

        cache[selectedPokemon] = pokemonData
        localStorage.setItem('pokedex', JSON.stringify(cache))
      }
      catch (error) {
        console.log(error.message)
      }
      finally {
        setLoading(false)
      }
    }
    fetchPokemonData()

  }, [selectedPokemon])



  return (
    <div></div>
  )
}
