import { useEffect, useState } from "react"
import { first151Pokemon, getFullPokedexNumber, getPokedexNumber } from "../utils/";
import TypeCard from "./TypeCard";
import Modal from "./Modal";

export default function PokeCard(props) {

  const { selectedPokemon } = props
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [skill, setSkill] = useState(null)
  const [loadingSkill, setLoadingSkill] = useState(false)

  const { name, height, abilities, stats, types, moves, sprites } = data || {}

  const imgList = Object.keys(sprites || {}).filter(val => {
    if (!sprites[val]) { return false }
    if (['versions', 'other'].includes(val)) { return false }
    return true
  })

  async function fetchMoveData(move, moveUrl) {
    if (loadingSkill || !localStorage || !moveUrl) { return }

    let moveCache = {}
    if (localStorage.getItem('pokemon-moves')) {
      moveCache = JSON.parse(localStorage.getItem('pokemon-moves'))
    }
    if (move in moveCache) {
      setSkill(moveCache[move])
      console.log('Found move in cache')
      return
    }

    try {
      setLoadingSkill(true)
      const res = await fetch(moveUrl)
      const moveData = await res.json()
      console.log('Fetched move from API', moveData)

      const description = moveData?.flavor_text_entries.filter
        (val => {
          return val.version_group.name == 'firered-leafgreen'
        })[0]?.flavor_text

      const skillData = {
        name: move,
        description
      }

      setSkill(skillData)
      moveCache[move] = skillData
      localStorage.setItem('pokemon-moves', JSON.stringify(moveCache))
    }
    catch (error) {
      console.log(error)
    }
    finally {
      setLoadingSkill(false)
    }
  }

  useEffect(() => {
    if (loading || !localStorage) { return }

    let cache = {}
    if (localStorage.getItem('pokedex')) {
      cache = JSON.parse(localStorage.getItem('pokedex'))
    }

    if (selectedPokemon in cache) {
      setData(cache[selectedPokemon])
      console.log('Found pokemon in cache')
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
    <div className="poke-card">
      {skill && (
        <Modal handleCloseModal={() => { setSkill(null) }}>
          <div>
            <h6>Name</h6>
            <h2 className="skill-name">{skill.name.replaceAll('-', ' ')}</h2>
          </div>
          <div>
            <h6>Description</h6>
            <p>{skill.description || 'No Description provided'}</p>
          </div>
        </Modal>
      )}
      <div>
        <h4>#{getFullPokedexNumber(selectedPokemon)}</h4>
        <h4>{first151Pokemon[selectedPokemon]}</h4>
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
      <h3>Stats</h3>
      <div className="stats-card">
        {
          stats.map((statObject, statIndex) => {
            const { stat, base_stat } = statObject
            return (
              <div key={statIndex} className="stat-item">
                <p>{stat?.name.replaceAll('-', ' ')}</p>
                <h4>{base_stat}</h4>
              </div>
            )
          })
        }
      </div>
      <h3>Moves</h3>
      <div className="pokemon-move-grid">
        {moves.map((moveObject, moveIndex) => {
          return (
            <button className="pokemon-move"
              key={moveIndex} onClick={() => {
                fetchMoveData(moveObject?.move?.name, moveObject?.move.url)
              }}>
              <p>{moveObject?.move?.name.replaceAll('-', ' ')}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
