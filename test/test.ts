import { Option, None } from 'option.ts'
import lift, { ArrayOps, ObjectOps, StringOps } from '../'
import range from '../lib/array/range'
import ObjSet from '../lib/object/set'
import * as is from '../lib/object/is'
import '../lib/all'
const expect = require('expect')


describe('lift', () => {

  it('can log every operation in a chain', () => {
    // TODO
  })

  describe('Array', () => {

    it('can be unwrapped', () => {
      const arr = [1, 2, 3]
      const unwrapped = lift(arr).value()
      expect(unwrapped).toBe(arr)
      expect(arr instanceof Array).toBe(true)
    })

    it('can be mapped', () => {
      const arr = [1, 2, 3]
      const mapped = lift(arr).map(x => x * 2).value()
      expect(mapped).toEqual([2, 4, 6])
      expect(mapped instanceof Array).toBe(true)
      expect(mapped).toNotBe(arr)
    })

    it('can be filtered', () => {
      const arr = [1, 2, 3, 4, 5, 6]
      const filtered = lift(arr)
        .map(n => n * 2)
        .filter(n => n > 6)
        .value()
      expect(filtered).toEqual([8, 10, 12])
      expect(filtered instanceof Array).toBe(true)
      expect(filtered).toNotBe(arr)
    })

    it('can append an item', () => {
      const arr = [1, 2, 3, 4, 5, 6]
      const updated = lift(arr).append(7).value()
      expect(updated).toEqual([1, 2, 3, 4, 5, 6, 7])
      expect(updated).toNotBe(arr)
    })

    it('can append an Array of items', () => {
      const arr = [1, 2, 3, 4, 5, 6]
      const updated = lift(arr).appendAll([7, 8, 9, 10]).value()
      expect(updated).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      expect(updated).toNotBe(arr)
    })

    it('can insert an item', () => {
      const arr = [1, 2, 3, 4, 5, 6]
      const updated = lift(arr).insert(2, 300).value()
      expect(updated).toEqual([1, 2, 300, 3, 4, 5, 6])
      expect(updated).toNotBe(arr)
    })

    it('can insert an Array of items', () => {
      const arr = [1, 2, 3, 4, 5, 6]
      const updated = lift(arr).insertAll(2, [300, 400]).value()
      expect(updated).toEqual([1, 2, 300, 400, 3, 4, 5, 6])
      expect(updated).toNotBe(arr)
    })

    it('can replace an item at a given index', () => {
      const arr = [1, 2, 3, 4, 5, 6]
      const updated = lift(arr)
        .updateAt(2, n => lift(n * 1000)) // test that we can return a lifted value as well
        .updateAt(5, n => n * 100)
        .updateAt(1000, n => n / 10)
        .value()

      expect(updated).toEqual([1, 2, 3000, 4, 5, 600])
      expect(updated).toNotBe(arr)
    })

    it('can remove an item at a given index', () => {
      const arr = ['a', 'b', 'c', 'd', 'e', 'f']
      const updated = lift(arr).removeAt(2).value()

      expect(updated).toEqual(['a', 'b', 'd', 'e', 'f'])
      expect(updated).toNotBe(arr)
    })

    it('can remove all falsy values', () => {
      const arr = [undefined, 'a', '', 'b', false, 'c', undefined, 'd', 'e', null, null, 'f', 0]
      const updated = lift(arr).compact().value()

      expect(updated).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])
      expect(updated).toNotBe(arr)
    })

    it('can find an item using a predicate', () => {
      const arr = [{ id: 11 }, { id: 22 }, { id: 33 }]

      const item = lift(arr).find(user => user.id === 22)
      expect(item.isDefined()).toBe(true) // Should be a Some()
      expect(item()).toEqual({ id: 22 })

      const missingItem = lift(arr).find(user => user.id === 999)
      expect(missingItem.isDefined()).toBe(false) // Should be a None
      expect(missingItem()).toEqual(undefined)
    })

    it('can find an item index using a predicate', () => {
      const arr = [{ id: 11 }, { id: 22 }, { id: 33 }]

      const maybeIndex = lift(arr).findIndex(user => user.id === 22)
      expect(maybeIndex.isDefined()).toBe(true) // Should be a Some()
      expect(maybeIndex()).toEqual(1)

      const noneIndex = lift(arr).findIndex(user => user.id === 999)
      expect(noneIndex.isDefined()).toBe(false) // Should be a None
      expect(noneIndex()).toEqual(undefined)
    })

    it('can be flattened', () => {
      const arr = [[1, 2], Option(3), None, [4, 5, 6], Option(null)]
      const result = lift(arr).flatten().value()
      expect(result).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('can count items satisfying a predicate', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3]
      const count = lift(arr).count(n => n > 3).value()
      expect(count).toBe(7)
    })

    it('can keep only the first ocurrence of any encountered item', () => {
      const arr = [{ id: 10 }, { id: 20 }, { id: 10 }, { id: 30 }, { id: 40 }, { id: 40 }]
      const result = lift(arr).distinct(u => u.id).value()
      expect(result).toEqual([{ id: 10 }, { id: 20 }, { id: 30 }, { id: 40 }])
      expect(result[0]).toBe(arr[0])
      expect(result[1]).toBe(arr[1])
      expect(result[2]).toBe(arr[3])
      expect(result[3]).toBe(arr[4])

      const arr2 = ['7', 1, 2, 2, 1, '3', '7', '2', '3']
      const result2 = lift(arr2).distinct().value()
      expect(result2).toEqual(['7', 1, 2, '3', '2'])
    })

    it('can join() its items', () => {
      const arr = ['a', 'b', 'c']
      const str = lift(arr).join(', ').value()
      expect(str).toBe('a, b, c')
    })

    it('can be sliced from the left', () => {
      const arr = [1, 2, 3, 4, 5, 6]
      const result = lift(arr).take(3).value()
      expect(result).toEqual([1, 2, 3])
    })

    it('can be sliced from the right', () => {
      const arr = [1, 2, 3, 4, 5, 6]
      const result = lift(arr).takeRight(3).value()
      expect(result).toEqual([4, 5, 6])
    })

    it('can create an object, grouping all items by key', () => {
      const arr = [
        { age: 10, name: 'jon' },
        { age: 30, name: 'momo' },
        { age: 10, name: 'kiki' },
        { age: 28, name: 'jesus' },
        { age: 29, name: 'frank' },
        { age: 30, name: 'michel' }
      ]

      const result = lift(arr).groupBy(p => p.age).value()

      expect(result).toEqual({
        10: [{ age: 10, name: 'jon' }, { age: 10, name: 'kiki' }],
        30: [{ age: 30, name: 'momo' }, { age: 30, name: 'michel' }],
        28: [{ age: 28, name: 'jesus' }],
        29: [{ age: 29, name: 'frank' }]
      })
    })

    it('can be reversed', () => {
      const arr = [1, 2, 3, 4]
      const result = lift(arr).reverse().value()
      expect(result).toEqual([4, 3, 2, 1])
    })

    it('allows its first item to be read', () => {
      const arr = [1, 2, 3, 4]
      const one = lift(arr).first()()
      expect(one).toBe(1)
      expect(lift([]).first()()).toBe(undefined)
    })

    it('allows its last item to be read', () => {
      const arr = [1, 2, 3, 4]
      const four = lift(arr).last()()
      expect(four).toBe(4)
      expect(lift([]).last()()).toBe(undefined)
    })

    it('allows an item to be read by index', () => {
      const arr = [1, 2, 3, 4]
      const item = lift(arr).get(2)
      expect(item.isDefined()).toBe(true)
      expect(item()).toBe(3)
      expect(lift(arr).get(999).isDefined()).toBe(false)
      expect(lift(arr).get(999)()).toBe(undefined)
    })

    it('can be sorted', () => {
      let sorted: any[], arr: any[]

      // Numbers
      arr = [5, 4, 1, 6, 2, 4, 3]
      sorted = lift(arr).sort().value()
      expect(sorted).toNotBe(arr)
      expect(sorted).toEqual([1, 2, 3, 4, 4, 5, 6])

      // Default case sensitive String sort
      arr = ['e', 'c', 'ca', 'A', 'F', 'd', 'b']
      sorted = lift(arr).sort().value()
      expect(sorted).toEqual(['A', 'F', 'b', 'c', 'ca', 'd', 'e'])

      // String sort using localeCompare
      arr = 'ä ba bb bä bz a e è é aa ae b ss sz sa st ß'.split(' ')
      sorted = lift(arr).sort({ localeCompare: true }).value()
      expect(sorted.join(' ')).toBe('a ä aa ae b ba bä bb bz e é è sa ss ß st sz')

      // String sort + ignoreCase
      arr = ['e', 'c', 'ca', 'A', 'F', 'd', 'b']
      sorted = lift(arr).sort({ ignoreCase: true }).value()
      expect(sorted).toEqual(['A', 'b', 'c', 'ca', 'd', 'e', 'F'])

      // Reverse
      arr = ['e', 'c', 'ca', 'A', 'F', 'd', 'b']
      sorted = lift(arr).sort({ reverse: true, ignoreCase: true }).value()
      expect(sorted).toEqual(['F', 'e', 'd', 'ca', 'c', 'b', 'A'])

      // Falsy values (Except 0) should be in tail position
      arr = ['e', 'c', '', undefined, 'ca', null, 'A', undefined, 'F', null, 'd', 'b']
      sorted = lift(arr).sort().value()
      expect(sorted).toEqual(['A', 'F', 'b', 'c', 'ca', 'd', 'e', '', undefined, null, undefined, null])

      // By
      const people = [
        { name: 'Jesse', creationDate: 2 },
        { name: 'Walt', creationDate: 1 },
        { name: 'Mike', creationDate: 4 },
        { name: 'Skyler', creationDate: 3 }
      ]

      sorted = lift(people)
        .sort({ by: p => p.creationDate })
        .map(p => p.name)
        .value()

      expect(sorted).toEqual(['Walt', 'Jesse', 'Skyler', 'Mike'])

      // Double-sort
      const people2 = [
        { name: 'Jesse', age: 44 },
        { name: 'Walt', age: 18 },
        { name: 'Mike', age: 20 },
        { name: 'Skyler', age: 37 },
        { name: 'Walt', age: 100 },
        { name: 'Tonton', age: 18 },
        { name: 'Jesse', age: 20 }
      ]

      sorted = lift(people2)
        .sort({ by: p => p.age })
        .sort({ by: p => p.name })
        .value()

      expect(sorted).toEqual([
        { name: 'Jesse', age: 20 },
        { name: 'Jesse', age: 44 },
        { name: 'Mike', age: 20 },
        { name: 'Skyler', age: 37 },
        { name: 'Tonton', age: 18 },
        { name: 'Walt', age: 18 },
        { name: 'Walt', age: 100 }
      ])
    })

    it('can tell whether at least one item satisfy a predicate', () => {
      const arr = [1, 2, 3, 4]
      const result = lift(arr).some(n => n > 2).value()
      expect(result).toBe(true)

      const result2 = lift(arr).some(n => n > 1000).value()
      expect(result2).toBe(false)
    })

    it('can tell whether all items satisfy a predicate', () => {
      const arr = [1, 2, 3, 4]
      const result = lift(arr).every(n => n > 2).value()
      expect(result).toBe(false)

      const result2 = lift(arr).every(n => n < 1000).value()
      expect(result2).toBe(true)
    })

    it('can fold its items', () => {
      const arr = ['a', 'b', 'c', 'd']
      const result = lift(arr).fold('zzz', (acc, value) => acc + value).value()
      expect(result).toBe('zzzabcd')

      expect(lift([] as string[]).fold('zzz', (acc, value) => acc + value).value()).toBe('zzz')

      const arr2 = [1, 2, 3]
      const seed2: number[] = []
      const result2 = lift(arr2).fold(seed2, (acc, value) => acc.concat(value))
      expect(result2 instanceof ArrayOps).toBe(true)
      expect(result2.value()).toEqual([1, 2, 3])
    })

    it('can fold its items from the right', () => {
      const arr = ['a', 'b', 'c', 'd']
      const result = lift(arr).foldRight('zzz', (acc, value) => acc + value).value()
      expect(result).toBe('zzzdcba')

      expect(lift([] as string[]).foldRight('zzz', (acc, value) => acc + value).value()).toBe('zzz')

      const arr2 = [1, 2, 3]
      const seed2: number[] = []
      const result2 = lift(arr2).foldRight(seed2, (acc, value) => acc.concat(value))
      expect(result2 instanceof ArrayOps).toBe(true)
      expect(result2.value()).toEqual([3, 2, 1])
    })

    it('can drop some items', () => {
      const arr = ['a', 'b', 'c', 'd']
      const result = lift(arr).drop(2).value()
      expect(result).toEqual(['c', 'd'])
      expect(lift(arr).drop(100).value()).toEqual([])
    })

    it('can drop some items from its right side', () => {
      const arr = ['a', 'b', 'c', 'd']
      const result = lift(arr).dropRight(2).value()
      expect(result).toEqual(['a', 'b'])
      expect(lift(arr).dropRight(100).value()).toEqual([])
    })

    it('can be converted to a Set-like object', () => {
      const arr = ['a', 'b', 'c', 'd']
      const result = lift(arr).toSet().value()
      expect(result).toEqual({ a: true, b: true, c: true, d: true })

      const arr2 = [1, 2, 3, 4]
      const result2 = lift(arr2).toSet().value()
      expect(result2).toEqual({ 1: true, 2: true, 3: true, 4: true })
    })

    it('can create a range', () => {
      const singleArgRange = range(5).value()
      expect(singleArgRange).toEqual([0, 1, 2, 3, 4])

      const rangeWithoutStep = range(1, 4).value()
      expect(rangeWithoutStep).toEqual([1, 2, 3, 4])

      const rangeWithStepOfOne = range(1, 4, 1).value()
      expect(rangeWithStepOfOne).toEqual([1, 2, 3, 4])

      const rangeWithStepOfFive = range(0, 15, 5).value()
      expect(rangeWithStepOfFive).toEqual([0, 5, 10, 15])

      const rangeWithNegativeStep = range(2, -4, -1).value()
      expect(rangeWithNegativeStep).toEqual([2, 1, 0, -1, -2, -3, -4])
    })

    it('can be arbitrarily transformed', () => {
      const arr = [1, 2, 3]
      const result = lift(arr)
        .transform(arr => {
          return arr.map(n => n * 2)
        })
        .value()
      expect(result).toEqual([2, 4, 6])

      // transform will use the correct wrapper depending on the return type. Array -> Object
      const result2 = lift(arr).transform(arr => ({ a: 1, b: 2 }))
      expect(result2 instanceof ObjectOps).toBe(true)
      expect(result2.value()).toEqual({ a: 1, b: 2 })

      // transform will use the correct wrapper depending on the return type. Array -> string
      const result3 = lift(arr).transform(arr => 'ohoh')
      expect(result3 instanceof StringOps).toBe(true)
      expect(result3.value()).toBe('ohoh')
    })

  })

  describe('Object', () => {

    it('can read the value associated to a key', () => {
      const obj = { a: 1, b: '2', c: { d: 10 } }
      const result = lift(obj).get('b')
      expect(result()).toBe('2')

      const map: Record<string, number | undefined> = { a: 1, b: 2, c: 3 }
      const result2 = lift(map).get('d').map(x => x.toFixed(3)) // toFixed to prove we got an Option<number> back
      expect(result2()).toBe(undefined)
    })

    it('can set a value', () => {
      const obj: Record<string, number> = { a: 1, b: 2, c: 22 }
      const result = lift(obj)
        .add('b', 3)
        .add('c', 222)
        .add('newKey', 10)
        .value()

      expect(result).toNotBe(obj)
      expect(result).toEqual({ a: 1, b: 3, c: 222, newKey: 10 })
    })

    it('can update an object', () => {
      const obj = { a: 1, b: 2, c: '3' }
      const result = lift(obj)
        .update({ a: 10, c: '33' })
        .update({ c: '333' })
        .value()
      expect(result).toNotBe(obj)
      expect(result).toEqual({ a: 10, b: 2, c: '333' })
    })

    it('can map the values of an object', () => {
      const obj: Record<string, number> = { a: 1, b: 2, c: 3 }
      const result = lift(obj).mapValues((key, value) => value * 2).value()
      expect(result).toNotBe(obj)
      expect(result).toEqual({ a: 2, b: 4, c: 6 })
    })

    it('can be converted to an Array', () => {
      const obj: Record<string, number> = { a: 1, b: 2, c: 3 }
      const result = lift(obj)
        .toArray()
        .sort({ by: ([k, v]) => k })
        .value()
      expect(result).toNotBe(obj)
      expect(result).toEqual([[ 'a', 1], ['b', 2], ['c', 3]])
    })

    it('can convert is keys to an Array', () => {
      const obj: Record<string, number> = { a: 1, b: 2, c: 3 }
      const result = lift(obj).keys().sort().value()
      expect(result).toNotBe(obj)
      expect(result).toEqual(['a', 'b', 'c'])
    })

    it('can convert is values to an Array', () => {
      const obj: Record<string, number> = { a: 1, b: 2, c: 3 }
      const result = lift(obj).values().sort().value()
      expect(result).toNotBe(obj)
      expect(result).toEqual([1, 2, 3])
    })

    it('can remove a key', () => {
      const obj: Record<string, number> = { a: 1, b: 2, c: 3 }
      const result = lift(obj).remove('a', 'c').value()
      expect(result).toNotBe(obj)
      expect(result).toEqual({ b: 2 })
    })

    it('can be created as a Set-like object', () => {
      const obj = ObjSet('a', 'b', 'c').value()
      expect(obj).toEqual({ a: true, b: true, c: true })
    })

    it('can determine whether an object is of a certain type', () => {
      expect(is.array(null)).toBe(false)
      expect(is.array(undefined)).toBe(false)
      expect(is.array([])).toBe(true)

      expect(is.func({})).toBe(false)
      expect(is.func(() => {})).toBe(true)
    })

  })

  describe('README examples', () => {

    it('can run example #1', () => {
      const people = [
        { id: 1, name: 'jon' },
        { id: 2, name: 'sarah' },
        { id: 3, name: 'nina' }
      ]

      const updatedPeople = lift(people)
        .findIndex(p => p.id === 2)
        .map(index => lift(people).updateAt(index, p => lift(p).update({ name: 'Nick' })))
        .getOrElse(people)

      expect(updatedPeople).toEqual([
        { id: 1, name: 'jon' },
        { id: 2, name: 'Nick' },
        { id: 3, name: 'nina' }
      ])
    })

  })

})