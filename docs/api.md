# Trax API

## Data object declaration
export function Data(c: any) { }
export function ref(proto, key: string) {
export function computed(proto, propName: string, descriptor: PropertyDescriptor) {

## To / From JSON, creation and disposal
new 
export function create<T>(c: Constructor<T> | Factory<T>, json?: Object): T {
function convertToJson(d: any, converter?: JSConverter)
export function dispose(traxObject: any /*DataObject*/, recursive = false) {

## Watchers and Trackers
export function watch(o: any, fn: WatchFunction): WatchFunction | null {
export function unwatch(o: any, watchFn: WatchFunction | null) {
export function numberOfWatchers(o: any): number {
export function track(o: any, fn: TrackFunction): TrackFunction | null {
export function untrack(o: any, trackFn: TrackFunction) {

## Versions and mutations
export function version(o: any /*DataObject*/): number {
export function isMutating(o: any /*TraxObject*/): boolean {
export async function changeComplete(o: any /*TraxObject*/) {
export function commitChanges(o: any /*TraxObject*/, forceNewRefreshContext = false) {

## Trax relationships
export function isDataObject(o: any /*TraxObject*/): boolean {
export function hasParents(o: any) {
export function getParents(traxObject: any): any[] | null

## Property helpers
export function hasProperty(traxObject: any /*TraxObject*/, propName: string): boolean {
export function createProperty(o: any, propName: string | number): any {
export function resetProperty(o: any, propName: string): any {
export function forEachProperty(traxObject: any /*TraxObject*/, processor: (propName: string, internalPropValue: any) => void) {
