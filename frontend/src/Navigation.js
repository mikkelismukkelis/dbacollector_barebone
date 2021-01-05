import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

const Nav = styled.div`
  background-color: #fff;
  padding: 10px;
  margin-bottom: 10px;
`

const StyledLink = styled(Link)`
  padding: 10px;
  text-decoration: none;
  color: #333;
  background: #f4f4f4;
  border: 1px #999 solid;
  margin-right: 5px;
  font-size: 20px;
  border-radius: 5px;

  &:hover {
    background: #01579b;
    color: #fff;
  }
`

const Navigation = () => {
  return (
    <Nav>
      <StyledLink className="active" to="/instanceinfo">
        Instance Info
      </StyledLink>
      <StyledLink to="/databaseinfo">Database info</StyledLink>
    </Nav>
  )
}

export default Navigation
