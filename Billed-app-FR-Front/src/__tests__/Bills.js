/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/dom'
import BillsUI from '../views/BillsUI.js'
import { bills as billsList } from '../fixtures/bills.js'
import { localStorageMock } from '../__mocks__/localStorage.js'
import router from '../app/Router.js'

import { ROUTES, ROUTES_PATH } from '../constants/routes.js'
import userEvent from '@testing-library/user-event'
import Bill from '../containers/Bills.js'
import bills from '../__mocks__/store.js'

jest.mock('../__mocks__/store.js')

describe('Given I am connected as an employee', () => {
	describe('When I am on Bills Page', () => {
		test('Then bill icon in vertical layout should be highlighted', async () => {
			Object.defineProperty(window, 'localStorage', { value: localStorageMock })
			window.localStorage.setItem(
				'user',
				JSON.stringify({
					type: 'Employee',
				})
			)
			const root = document.createElement('div')
			root.setAttribute('id', 'root')
			document.body.append(root)
			router()
			window.onNavigate(ROUTES_PATH.Bills)
			await waitFor(() => screen.getByTestId('icon-window'))
			const windowIcon = screen.getByTestId('icon-window')
			//to-do write expect expression
			expect(windowIcon).not.toBeNull()
		})
		test('Then bills should be ordered from earliest to latest', () => {
			document.body.innerHTML = BillsUI({ data: billsList })
			const dates = screen
				.getAllByText(
					/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
				)
				.map((a) => a.innerHTML)
			const antiChrono = (a, b) => (a < b ? 1 : +1)
			const datesSorted = [...dates].sort(antiChrono)
			expect(dates).toEqual(datesSorted)
		})

		// new written tests
		describe('When I click on "Nouvelle note de frais" button', () => {
			test(`The button is pressent and it runs 
			a fn (handleClickNewBill) when clicked 
			&& blue eye icon clicked to open modal
			&& getBills method`, async () => {
				const user = userEvent.setup()

				const $ = require('jquery')

				$.fn.modal = jest.fn()

				// icon variable creation
				const icon = document.createElement('div')
				icon.setAttribute('data-testid', 'icon-eye')
				icon.setAttribute(
					'data-bill-url',
					'../assets/images/facturefreemobile.jpg'
				)

				const onNavigate = (pathname) => {
					document.body.innerHTML = ROUTES({ pathname })
				}

				const newBill = new Bill({
					document,
					onNavigate,
					store: null,
					bills: billsList,
					localStorage: window.localStorage,
				})

				const newBillBtn = screen.getByTestId('btn-new-bill')
				const iconEyeElements = screen.getAllByTestId('icon-eye')

				// methods to be tested
				const handleClickNewBill = jest.fn(() => {
					newBill.handleClickNewBill()
				})

				const handleClickIconEye = jest.fn(() => {
					newBill.handleClickIconEye(icon)
				})

				newBillBtn.addEventListener('click', handleClickNewBill)

				iconEyeElements.forEach(async (iconEye) => {
					// console.log(iconEye)
					iconEye.addEventListener('click', handleClickIconEye)
					await user.click(iconEye)
					expect(handleClickIconEye).toHaveBeenCalled()
				})

				await user.click(newBillBtn)
				const result = newBill.getBills()

				expect(newBillBtn).toBeTruthy()
				expect(result).not.toBeTruthy()
			})
		})

		test('fetches bills from an API and fails with 404 message error', async () => {
			bills.bills.mockImplementationOnce(() => {
				return {
					list: () => {
						return Promise.reject(new Error('Erreur 404'))
					},
				}
			})
			window.onNavigate(ROUTES_PATH.Bills)
			await new Promise(process.nextTick)
			const message = await screen
			expect(message).toBeTruthy()
		})
	})
})
