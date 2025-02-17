import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useApi } from '../../contexts/ApiContext'
import { useSession } from '../../contexts/SessionContext'
import { useToast, ToastType } from '../../contexts/ToastContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useWebsocket } from '../../contexts/WebsocketContext'

export const SingleProfessionalCard = (props) => {
  const {
    UIComponent,
    professional,
    handleUpdateProfessionals
  } = props

  const [ordering] = useApi()
  const socket = useWebsocket()
  const [{ user, token }] = useSession()
  const [, { showToast }] = useToast()
  const [, t] = useLanguage()

  const [actionState, setActionState] = useState({ loading: false, error: null })

  /**
   * Method to add, remove favorite info for user from API
   */
  const handleFavoriteProfessional = async (isAdd = false) => {
    if (!professional || !user) return
    showToast(ToastType.Info, t('LOADING', 'loading'))
    try {
      setActionState({ ...actionState, loading: true, error: null })
      const changes = { object_id: professional?.id }
      const requestOptions = {
        method: isAdd ? 'POST' : 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-App-X': ordering.appId,
          'X-Socket-Id-X': socket?.getId()
        },
        ...(isAdd && { body: JSON.stringify(changes) })
      }

      const fetchEndpoint = isAdd
        ? `${ordering.root}/users/${user?.id}/favorite_users`
        : `${ordering.root}/users/${user.id}/favorite_users/${professional?.id}`
      const response = await fetch(fetchEndpoint, requestOptions)
      const content = await response.json()

      if (!content.error) {
        setActionState({ ...actionState, loading: false })
        handleUpdateProfessionals && handleUpdateProfessionals(professional?.id, { favorite: isAdd })
        showToast(ToastType.Success, isAdd ? t('FAVORITE_ADDED', 'Favorite added') : t('FAVORITE_REMOVED', 'Favorite removed'))
      } else {
        setActionState({
          ...actionState,
          loading: false,
          error: content.result
        })
        showToast(ToastType.Error, content.result)
      }
    } catch (error) {
      setActionState({
        ...actionState,
        loading: false,
        error: [error.message]
      })
      showToast(ToastType.Error, [error.message])
    }
  }

  return (
    <>
      {UIComponent && (
        <UIComponent
          {...props}
          handleFavoriteProfessional={handleFavoriteProfessional}
          actionState={actionState}
        />
      )}
    </>
  )
}

SingleProfessionalCard.propTypes = {
  /**
   * UI Component, this must be containt all graphic elements and use parent props
   */
  UIComponent: PropTypes.elementType,
  /**
   * Businessid, this must be contains an business id for get data from API
   */
  businessId: PropTypes.number
}
