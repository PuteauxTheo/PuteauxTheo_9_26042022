/**
 * @jest-environment jsdom
 */

import { fireEvent, queryByTestId, screen, waitFor } from "@testing-library/dom"
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import Router from "../app/Router.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import mockStore from "../__mocks__/store"
import { bills } from "../fixtures/bills"
import userEvent from "@testing-library/user-event";
import Dashboard from "../containers/Dashboard.js";
import query from "express/lib/middleware/query";


jest.spyOn(window, 'alert').mockImplementation(() => {});


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the form is display", async () =>{
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const html = NewBillUI()
      document.body.innerHTML = html
      expect(screen.getByTestId('form-new-bill')).toBeTruthy()
    })
    test("Then message icon in vertical layout shoud be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement('div')
      root.setAttribute('id','root')
      document.body.append(root)
      Router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getAllByTestId('icon-mail'))
      const mailIcon = screen.getAllByTestId('icon-mail')
      expect(mailIcon).toBeTruthy()
    })
  })
})

describe(" Given I am connedted as an employee and i clicked on new bill", () => {
  describe("When I choose file that match with the right format ", () => {
    test("Then the file should be filed in justificatory", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const html = NewBillUI()
      document.body.innerHTML = html

      const newBill = new NewBill({
        document, onNavigate, store: null, localStorage : window.localStorage
      })

      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      const fileInput = screen.getByTestId('file')

      const fileTest = new File(["fileTest"], " fileTest.jpg", { type: "image/jpeg"})

      fileInput.addEventListener('change',handleChangeFile)
      fireEvent.change(fileInput, {target: { files: [fileTest]}})
      expect(fileInput.files[0]).toStrictEqual(fileTest)
    })
  })
  describe("When i choose file that not match with the right foramt", () => {
    test("Then the file shouldn't be filed in justificatory", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const html = NewBillUI()
      document.body.innerHTML = html

      const newBill = new NewBill({
        document, onNavigate, store: null, localStorage : window.localStorage
      })

      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      const fileInput = screen.getByTestId('file')

      const fileTest = new File(["fileTest"], " fileTest.txt", { type: "text/plain"})

      fileInput.addEventListener('change',handleChangeFile)
      fireEvent.change(fileInput, {target: { files: [fileTest]}})
      expect(window.alert).toHaveBeenCalled()
    })
  })
  describe("When all field of the form are completed, i clicked on send", () => {
    test("Then the newBill must be add to the all bills", async ()  => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({pathname})
      }
      const newBill = new NewBill({
        document, onNavigate, store:null, localStorage: window.localStorage
      })

      const form = screen.getByTestId('form-new-bill')
      
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      form.addEventListener('submit', handleSubmit)

      fireEvent.submit(form)
      expect(handleSubmit).toHaveBeenCalled()
      expect(screen.getByText('Mes notes de frais')).toBeTruthy()

    })
  })
  describe("when none field of form are completed,  i clicked on send", () => {
    test("Then it should renders newBill page", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const html = NewBillUI()
      document.body.innerHTML = html

      const inputNameExpense = screen.getByTestId("expense-name")
      expect(inputNameExpense.value).toBe("")
      const inputDatepicker = screen.getByTestId("datepicker")
      expect(inputDatepicker.value).toBe("")
      const inputAmount = screen.getByTestId("amount")
      expect(inputAmount.value).toBe("")
      const inputVat = screen.getByTestId("vat")
      expect(inputVat.value).toBe("")
      const inputPct = screen.getByTestId("pct")
      expect(inputPct.value).toBe("")

      const form = screen.getByTestId("form-new-bill")
      const handleSubmit = jest.fn((e) => e.preventDefault())

      form.addEventListener("submit", handleSubmit)
      fireEvent.submit(form)
      expect(screen.getByTestId("form-new-bill")).toBeTruthy()

    })
  })
})

// test d'integration send newBill
describe("Given I am a user connected as employee", () => {  
  jest.spyOn(mockStore, "bills")
  describe("When i send newBill ", () => {
    test("fetches newBill from api", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      
      const newBill = new NewBill( {
        document, onNavigate, store:null, localStorage: window.localStorage,
      })

      const testBills = { 
        "type": "Transports",
        "name": "test",
        "date": "2022-05-13",
        "amount": 100,
        "vat": 70,
        "pct": 20,
        "commentary": " test Comment",
        "commentAdmin": "test",
        "fileName": "test.jpg",
        "status": "pending",
        "fileUrl": "https://test.net"
      };

      screen.queryByTestId("expense-type").value = testBills.type
      screen.queryByTestId("expense-name").value = testBills.name
      screen.queryByTestId("datepicker").value = testBills.date
      screen.queryByTestId("amount").value = testBills.amount
      screen.queryByTestId("vat").value = testBills.vat
      screen.queryByTestId("pct").value = testBills.pct
      screen.queryByTestId("commentary").value = testBills.commentary

      newBill.fileName = testBills.fileName
      newBill.fileUrl = testBills.fileUrl
      newBill.updateBill = jest.fn()

      
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      const form = screen.getByTestId('form-new-bill')
      form.addEventListener('submit', handleSubmit)
      fireEvent.submit(form)
      expect(handleSubmit).toHaveBeenCalled()
      expect(newBill.updateBill).toHaveBeenCalled()



    })
  })
  describe("When an error occurs on API", () => {
    test("Message error 404", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return { 
            create : () => {
            return Promise.reject(new Error("Erreur 404"))
          }
        }
      })
      const html = BillsUI( {error : "Erreur 404"})
      document.body.innerHTML = html
      await new Promise(process.nextTick)
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("Message error 505", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return { 
          create : () => {
            return Promise.reject(new Error("Erreur 500"))
          }
        }
      })
      const html = BillsUI( {error : "Erreur 500"} )
      document.body.innerHTML = html
      await new Promise(process.nextTick)
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})