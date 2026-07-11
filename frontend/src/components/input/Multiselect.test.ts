import {afterEach, describe, expect, it} from 'vitest'
import {mount} from '@vue/test-utils'
import {createI18n} from 'vue-i18n'

import en from '@/i18n/lang/en.json'
import Multiselect from './Multiselect.vue'

const i18n = createI18n({legacy: false, locale: 'en', messages: {en}})

const nixLabel = {id: 1, title: 'nix'}
const wrappers: ReturnType<typeof mount>[] = []

afterEach(() => {
	wrappers.forEach(wrapper => wrapper.unmount())
	wrappers.length = 0
})

function mountMultiselect(confirmCreateOnEnter = false) {
	const wrapper = mount(Multiselect, {
		attachTo: document.body,
		props: {
			modelValue: [],
			multiple: true,
			creatable: true,
			confirmCreateOnEnter,
			label: 'title',
			searchResults: [],
			onSearch: (query: string) => wrapper.setProps({
				searchResults: query === 'ni' ? [nixLabel] : [],
			}),
		},
		global: {
			plugins: [i18n],
			stubs: {
				Icon: true,
				RouterLink: true,
			},
		},
	})
	wrappers.push(wrapper)

	return wrapper
}

describe('Multiselect creation on Enter', () => {
	it('selects the first partial match when confirmation is enabled', async () => {
		const wrapper = mountMultiselect(true)
		const input = wrapper.find('input')

		await input.setValue('ni')
		await input.trigger('keyup', {key: 'Enter'})

		expect(wrapper.emitted('select')?.[0]).toEqual([nixLabel])
		expect(wrapper.emitted('create')).toBeUndefined()
	})

	it('requires a second Enter when there are no matches', async () => {
		const wrapper = mountMultiselect(true)
		const input = wrapper.find('input')

		await input.setValue('new label')
		await input.trigger('keyup', {key: 'Enter'})

		expect(wrapper.emitted('create')).toBeUndefined()
		const createOption = wrapper.find('.is-create-option')
		expect(document.activeElement).toBe(createOption.element)

		await createOption.trigger('keyup', {key: 'Enter'})
		expect(wrapper.emitted('create')?.[0]).toEqual(['new label'])
	})

	it('keeps immediate creation as the default behavior', async () => {
		const wrapper = mountMultiselect()
		const input = wrapper.find('input')

		await input.setValue('new label')
		await input.trigger('keyup', {key: 'Enter'})

		expect(wrapper.emitted('create')?.[0]).toEqual(['new label'])
	})
})
