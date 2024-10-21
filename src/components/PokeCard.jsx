import { useEffect, useState } from "react"
import { getFullPokedexNumber, getPokedexNumber } from "../utils/";
import TypeCard from "./TypeCard";

export default function PokeCard(props) {

  const { selectedPokemon } = props
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const { name, height, abilities, stats, types, moves, sprites } = data || {}

  const imgList = Object.keys(sprites || {}).filter(val => {
    if (!sprites[val]) { return false }
    if (['versions', 'other'].includes(val)) { return false }
    return true
  })

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

  if (loading || !data) {
    return <div>
      <h4>Loading...</h4>
    </div>
  }

  return (
    <div>
      <div className="poke-card">
        <h4>#{getFullPokedexNumber(selectedPokemon)}</h4>
        <h4>{name}</h4>
      </div>
      <div className="type-container">
        {types.map((typeObject, typeIndex) => {
          return (
            <TypeCard key={typeIndex} type={typeObject?.type?.name} />
          )
        })}
      </div>
      <img className="default-img"
        src={'/pokemon/' + getFullPokedexNumber(selectedPokemon) + '.png'}
        alt={`${name}-large-img`} />
      <div className="img-container">
        {imgList.map((spriteKey, spriteIndex) => {
          const imgUrl = sprites[spriteKey]
          return (
            <img key={spriteIndex} src={imgUrl}
              alt={`${name}-img-${spriteKey}`}
            />
          )
        })

        }
      </div>
    </div>
  )
}
