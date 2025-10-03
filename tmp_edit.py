from pathlib import Path
path = Path("src/pages/Database.tsx")
text = path.read_text(encoding="utf-8")
start = text.find("  const renderCategoryCard = useCallback(")
if start == -1:
    raise SystemExit("renderCategoryCard start not found")
end = text.find("  const fetchItemDetails", start)
if end == -1:
    raise SystemExit("renderCategoryCard end not found")
new_block = "  const renderCategoryCard = useCallback(\n    (entity: RawEntity, index: number, categoryId: string): JSX.Element | null => {\n      const config = CATEGORY_CONFIGS[categoryId];\n      if (!config) return null;\n\n      const Icon = config.icon;\n      const name = entity.name ?? 'Unknown';\n      const subtitle = config.getSubtitle?.(entity);\n      const badges = config.getBadges?.(entity) ?? [];\n      const meta = config.getMeta?.(entity) ?? [];\n      const description = config.getDescription?.(entity);\n      const highlight = config.getHighlight?.(entity);\n      const rarityValue = asStringOrNumber(entity.rarity ?? entity.Rarity);\n      const rarityLabel = getRarityLabel(rarityValue);\n      const iconSource =\n        config.resolveIcon?.(entity) ??\n        asString(entity.icon) ??\n        asString(getProperty(entity.perkMod, 'icon'));\n      const imageUrl = resolveIconUrl(iconSource);\n      const cardKey = `${categoryId}-${entity.id ?? index}`;\n      const hoverKey = config.hoverType ? `${config.hoverType}:${entity.id}` : null;\n      const isHoveringItem = config.hoverType === 'item' && hoveredItem && hoveredItem.id === entity.id;\n      const isHoveringPerk = config.hoverType === 'perk' && hoveredPerk && hoveredPerk.id === entity.id;\n      const showLoading = hoverKey ? hoverLoading && activeHoverKey === hoverKey : false;\n      const isClickable = Boolean(config.detailRoute || config.externalDetailUrl);\n      const isExternal = Boolean(config.externalDetailUrl && !config.detailRoute);\n      const DetailIcon = isExternal ? ExternalLink : ChevronRight;\n\n      if (categoryId === 'items') {\n        const rowKey = cardKey;\n        const cardAccent = getCardAccentClasses(rarityValue);\n        const tierValue = entity.tier ?? entity.Tier;\n        const tierLabel = toRomanNumeral(tierValue) ?? (tierValue ? String(tierValue) : '—');\n        const gearScoreMin =\n          asNumber(entity.gearScoreMin ?? entity.gearScoreLow ?? entity.gearScore) ??\n          asNumber(entity.gearScoreMax ?? entity.gearScore);\n        const gearScoreMax =\n          asNumber(entity.gearScoreMax ?? entity.gearScore ?? entity.gearScoreMin ?? entity.gearScoreLow);\n        let gearScoreLabel = '—';\n        if (gearScoreMin && gearScoreMax) {\n          gearScoreLabel = gearScoreMin === gearScoreMax ? String(gearScoreMax) : `${gearScoreMin} – ${gearScoreMax}`;\n        } else if (gearScoreMax) {\n          gearScoreLabel = String(gearScoreMax);\n        }\n\n        const perkEntries = asArray<Record<string, unknown>>(entity.perks).slice(0, 4);\n        let randomSlots = asArray<Record<string, unknown>>(entity.perkBuckets).length;\n        const perkTokens: JSX.Element[] = [];\n\n        const createToken = (key: string, content: JSX.Element | string, className: string) => (\n          <span\n            key={key}\n            className={`flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-slate-900/60 text-[11px] font-medium ${className}`}\n          >\n            {content}\n          </span>\n        );\n\n        perkEntries.forEach((perkEntry, perkIndex) => {\n          const perkIcon = toStringValue(perkEntry.icon);\n          const perkName = toStringValue(perkEntry.name) ?? 'Perk';\n          if (perkIcon) {\n            perkTokens.push(\n              createToken(\n                `${rowKey}-perk-${perkIndex}`,\n                <img\n                  src={resolveIconUrl(perkIcon)}\n                  alt={perkName}\n                  className=\"h-full w-full object-cover\"\n                  onError={(event) => {\n                    (event.currentTarget as HTMLImageElement).src = '/placeholder.svg';\n                  }}\n                />,\n                ''\n              ),\n            );\n          } else {\n            perkTokens.push(createToken(`${rowKey}-perk-${perkIndex}`, perkName.slice(0, 1).toUpperCase(), 'text-slate-200'));\n          }\n        });\n\n        while (perkTokens.length < 4 && randomSlots > 0) {\n          perkTokens.push(\n            createToken(\n              `${rowKey}-random-${randomSlots}`,\n              <Sparkles className="h-3.5 w-3.5 text-yellow-300" />,\n              'border-yellow-400/40 bg-yellow-500/10 text-yellow-200',\n            ),\n          );\n          randomSlots -= 1;\n        }\n\n        while (perkTokens.length < 4) {\n          perkTokens.push(createToken(`${rowKey}-empty-${perkTokens.length}`, '—', 'text-slate-500'));\n        }\n\n        const rowContent = (\n          <div\n            onMouseEnter={() => handleEntityHover(String(entity.id), 'item')}\n            onMouseLeave={handleMouseLeave}\n            onClick={() => {\n              if (isClickable) {\n                selectEntity(entity, categoryId);\n              }\n            }}\n            onKeyDown={(event) => {\n              if (!isClickable) return;\n              if (event.key === 'Enter' || event.key === ' ') {\n                event.preventDefault();\n                selectEntity(entity, categoryId);\n              }\n            }}\n            role={isClickable ? 'button' : undefined}\n            tabIndex={isClickable ? 0 : -1}\n            className={`group/item relative grid grid-cols-[minmax(220px,2fr),minmax(180px,1.3fr),minmax(120px,0.9fr),minmax(70px,0.6fr),minmax(120px,0.9fr)] items-center gap-4 px-5 py-4 transition-colors duration-200 ${\n              isClickable ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950' : 'cursor-default'\n            } ${cardAccent.shadow} ${cardAccent.hoverShadow} bg-slate-950/40 hover:bg-slate-900/70`}\n          >\n            <span className={`pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${cardAccent.topLine}`} aria-hidden="true" />\n            <span className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${cardAccent.accent} opacity-0 transition-opacity duration-300 group-hover/item:opacity-100`} aria-hidden="true" />\n            <div className="relative flex items-center gap-4">\n              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${cardAccent.icon}`}>\n                {iconSource ? (\n                  <img\n                    src={imageUrl}\n                    alt={String(name)}\n                    className="h-full w-full object-contain p-1.5"\n                    loading="lazy"\n                    onError={(event) => {\n                      (event.currentTarget as HTMLImageElement).src = '/placeholder.svg';\n                    }}\n                  />\n                ) : (\n                  <Icon className="h-5 w-5 text-slate-200" />\n                )}\n              </div>\n              <div className="flex flex-col gap-1">\n                <span className="text-sm font-semibold text-slate-100">{String(name)}</span>\n                {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}\n              </div>\n            </div>\n            <div className="flex flex-wrap items-center gap-2">{perkTokens}</div>\n            <div className="text-sm font-medium text-slate-200">{rarityLabel}</div>\n            <div className="text-sm font-medium text-slate-200">{tierLabel}</div>\n            <div className="flex items-center justify-between gap-3 text-sm font-medium text-slate-200">\n              <span>{gearScoreLabel}</span>\n              {isClickable && <DetailIcon className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover/item:translate-x-1 group-hover/item:text-white" />}\n            </div>\n          </div>\n        );\n\n        return (\n          <HoverCard key={rowKey} openDelay={100} closeDelay={150}>\n            <HoverCardTrigger asChild>{rowContent}</HoverCardTrigger>\n            <HoverCardContent side="top" align="start" className="max-w-md border-slate-700/70 bg-slate-900/95">\n              {showLoading ? (\n                <div className="space-y-4 p-4">\n                  <Skeleton className="h-12 w-full rounded-md bg-slate-800/70" />\n                  <Skeleton className="h-6 w-full rounded-md bg-slate-800/70" />\n                  <Skeleton className="h-6 w-3/4 rounded-md bg-slate-800/70" />\n                </div>\n              ) : isHoveringItem && hoveredItem ? (\n                <div className="space-y-3 p-4">\n                  <div className="flex items-start gap-3">\n                    <img\n                      src={resolveIconUrl(hoveredItem.icon ?? hoveredItem.iconHiRes)}\n                      alt={hoveredItem.name}\n                      className="h-14 w-14 rounded-lg border border-slate-700/70 bg-slate-900/80 object-contain"\n                      onError={(event) => {\n                        (event.currentTarget as HTMLImageElement).src = '/placeholder.svg';\n                      }}\n                    />\n                    <div className="space-y-1">\n                      <h4 className={`text-lg font-semibold ${getRarityTextClasses(hoveredItem.rarity)}`}>{hoveredItem.name}</h4>\n                      {hoveredItem.itemType && <p className="text-sm text-slate-300">{hoveredItem.itemType}</p>}\n                      <div className="flex flex-wrap gap-2">\n                        <Badge className={getBadgeClassName({ label: `Tier ${hoveredItem.tier ?? '?'}`, tone: 'outline' })}>\n                          Tier {hoveredItem.tier ?? '?'}\n                        </Badge>\n                        {hoveredItem.gearScoreMax && (\n                          <Badge className="border-none bg-slate-800/80 text-slate-200">GS {hoveredItem.gearScoreMax}</Badge>\n                        )}\n                      </div>\n                    </div>\n                  </div>\n\n                  {hoveredItem.description && <p className="text-sm text-slate-200">{hoveredItem.description}</p>}\n\n                  {hoveredItem.attributes?.length ? (\n                    <div className="space-y-1 text-sm text-blue-300">\n                      {hoveredItem.attributes.slice(0, 3).map((attribute, attributeIndex) => (\n                        <div key={`${rowKey}-attribute-${attributeIndex}`} className="flex items-center gap-2">\n                          <span className="h-2 w-2 rounded-full bg-blue-400" />\n                          <span>\n                            +{attribute.value} {attribute.name}\n                            {attribute.isSelectable ? ' (selectable)' : ''}\n                          </span>\n                        </div>\n                      ))}\n                    </div>\n                  ) : null}\n\n                  {hoveredItem.perks?.length ? (\n                    <div className="space-y-1 text-sm text-yellow-300">\n                      {hoveredItem.perks.slice(0, 3).map((perk, perkIndex) => (\n                        <div key={`${rowKey}-perk-${perkIndex}`} className="flex items-center gap-2">\n                          <span className="h-2 w-2 rounded-full bg-yellow-400" />\n                          <span>{perk.name ?? 'Random Perk'}</span>\n                        </div>\n                      ))}\n                      {hoveredItem.perks.length > 3 && (\n                        <p className="text-xs text-slate-400">+{hoveredItem.perks.length - 3} more perks</p>\n                      )}\n                    </div>\n                  ) : null}\n\n                  {hoveredItem.randomPerkBuckets?.length ? (\n                    <div className="space-y-1 text-xs text-amber-200">\n                      {hoveredItem.randomPerkBuckets.slice(0, 1).map((bucket, bucketIndex) => (\n                        <div key={`${rowKey}-bucket-${bucketIndex}`} className="space-y-1">\n                          <p className="text-sm font-semibold text-yellow-300">\n                            Random ({formatChance(bucket.chance)})\n                          </p>\n                          <div className="space-y-1 text-[11px] text-amber-100">\n                            {bucket.options.slice(0, 3).map((option, optionIndex) => (\n                              <div\n                                key={`${rowKey}-bucket-${bucketIndex}-option-${optionIndex}`}\n                                className="flex items-center gap-2"\n                              >\n                                <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />\n                                <span>{formatChance(option.chance)} {option.name ?? option.id}</span>\n                              </div>\n                            ))}\n                            {bucket.options.length > 3 && (\n                              <p className="text-[10px] text-slate-400">\n                                +{bucket.options.length - 3} more possibilities\n                              </p>\n                            )}\n                          </div>\n                        </div>\n                      ))}\n                    </div>\n                  ) : null}\n                </div>\n              ) : config.hoverType === 'perk' && isHoveringPerk && hoveredPerk ? (\n                <div className="space-y-3 p-4">\n                  <div className="flex items-start gap-3">\n                    <img\n                      src={resolveIconUrl(hoveredPerk.icon)}\n                      alt={hoveredPerk.name}\n                      className="h-14 w-14 rounded-lg border border-slate-700/70 bg-slate-900/80 object-contain"\n                      onError={(event) => {\n                        (event.currentTarget as HTMLImageElement).src = '/placeholder.svg';\n                      }}\n                    />\n                    <div className="space-y-1">\n                      <h4 className={`text-lg font-semibold ${getRarityTextClasses(hoveredPerk.rarity)}`}>{hoveredPerk.name}</h4>\n                      {hoveredPerk.itemType && <p className="text-sm text-slate-300">{hoveredPerk.itemType}</p>}\n                      <Badge className={getBadgeClassName({ label: `Tier ${hoveredPerk.tier ?? '?'}`, tone: 'outline' })}>\n                        Tier {hoveredPerk.tier ?? '?'}\n                      </Badge>\n                    </div>\n                  </div>\n                  {hoveredPerk.description && <p className="text-sm text-slate-200">{hoveredPerk.description}</p>}\n                </div>\n              ) : (\n                <div className="p-4 text-sm text-slate-300">Hover to load detailed stats.</div>\n              )}\n            </HoverCardContent>\n          </HoverCard>\n        );\n      }\n\n      const cardAccent = getCardAccentClasses(rarityValue);\n\n      const cardBody = (\n        <Card\n          key={cardKey}\n          onMouseEnter={config.hoverType ? () => handleEntityHover(String(entity.id), config.hoverType) : undefined}\n          onMouseLeave={config.hoverType ? handleMouseLeave : undefined}\n          onClick={() => {\n            if (isClickable) {\n              selectEntity(entity, categoryId);\n            }\n          }}\n          onKeyDown={(event) => {\n            if (isClickable && (event.key === 'Enter' || event.key === ' ')) {\n              event.preventDefault();\n              selectEntity(entity, categoryId);\n            }\n          }}\n          role={isClickable ? 'button' : undefined}\n          tabIndex={isClickable ? 0 : -1}\n          className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border ${cardAccent.border} bg-slate-950/40 backdrop-blur-xl transition-transform duration-300 ${cardAccent.shadow} ${cardAccent.hoverShadow} ${\n            isClickable ? 'cursor-pointer hover:-translate-y-1.5 focus-visible:-translate-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950' : 'cursor-default'\n          }`}
        >
          <span className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${cardAccent.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} aria-hidden="true" />
          <span className={`pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${cardAccent.topLine}`} aria-hidden="true" />
          <CardContent className="relative z-10 flex flex-col gap-6 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${cardAccent.icon}`}>
                  {iconSource ? (
                    <img
                      src={imageUrl}
                      alt={String(name)}
                      className="h-full w-full object-contain p-1.5"
                      loading="lazy"
                      onError={(event) => {
                        (event.currentTarget as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  ) : (
                    <Icon className="h-5 w-5 text-slate-200" />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-white">{String(name)}</h3>
                    {rarityLabel && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-[11px] uppercase tracking-[0.3em] text-slate-200">
                        {rarityLabel}
                      </span>
                    )}
                  </div>
                  {subtitle && <p className="text-sm text-slate-300">{subtitle}</p>}
                </div>
              </div>
              {highlight && (
                <div className="min-w-[120px] rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-right text-slate-100">
                  <p className="text-[11px] uppercase tracking-[0.35em] text-slate-400">{highlight.label}</p>
                  <p className="mt-1 text-base font-semibold">{highlight.value}</p>
                </div>
              )}
            </div>

            {description && <p className="text-sm leading-relaxed text-slate-300">{description}</p>}

            {badges.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {badges.map((badge, badgeIndex) => (
                  <Badge key={`${cardKey}-badge-${badgeIndex}`} className={`${getBadgeClassName(badge)} text-[11px] px-2.5 py-0.5`}>
                    {badge.label}
                  </Badge>
                ))}
              </div>
            )}

            {meta.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {meta.map((entry, metaIndex) => (
                  <div key={`${cardKey}-meta-${metaIndex}`} className="rounded-lg border border-white/8 bg-white/5 px-3 py-2 text-left text-slate-200">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">{entry.label}</p>
                    <p className="mt-1 font-semibold text-slate-100">{entry.value}</p>
                  </div>
                ))}
              </div>
            )}

            {isClickable && (
              <div className="mt-auto flex items-center justify-between text-xs text-slate-300">
                <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-slate-400">
                  <Icon className="h-4 w-4 text-slate-300" />
                  {config.name}
                </span>
                <span className="inline-flex items-center gap-2 font-medium text-slate-300 transition-all duration-200 group-hover:text-white">
                  View details
                  <DetailIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      );

      if (!config.hoverType) {
        return (
          <Tooltip key={cardKey}>
            <TooltipTrigger asChild>{cardBody}</TooltipTrigger>
            <TooltipContent side="top" className="max-w-sm border-slate-700/70 bg-slate-900/95">
              {config.renderTooltipContent ? (
                config.renderTooltipContent(entity)
              ) : (
                <div className="space-y-2 text-sm text-slate-200">
                  {description ? <p>{description}</p> : <p>No additional details available yet.</p>}
                  {meta.length > 0 && (
                    <div className="grid gap-2 text-xs text-slate-400">
                      {meta.map((entry, metaIndex) => (
                        <div key={`${cardKey}-tooltip-meta-${metaIndex}`} className="flex items-center justify-between gap-4">
                          <span className="uppercase tracking-[0.2em] text-slate-500">{entry.label}</span>
                          <span className="font-medium text-slate-200">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TooltipContent>
          </Tooltip>
        );
      }

      return (
        <HoverCard key={cardKey} openDelay={100} closeDelay={150}>
          <HoverCardTrigger asChild>{cardBody}</HoverCardTrigger>
          <HoverCardContent side="top" align="start" className="max-w-md border-slate-700/70 bg-slate-900/95">
            {showLoading ? (
              <div className="space-y-4 p-4">
                <Skeleton className="h-12 w-full rounded-md bg-slate-800/70" />
                <Skeleton className="h-6 w-full rounded-md bg-slate-800/70" />
                <Skeleton className="h-6 w-3/4 rounded-md bg-slate-800/70" />
              </div>
            ) : config.hoverType === 'item' && isHoveringItem && hoveredItem ? (
              <div className="space-y-3 p-4">
                <div className="flex items-start gap-3">
                  <img
                    src={resolveIconUrl(hoveredItem.icon ?? hoveredItem.iconHiRes)}
                    alt={hoveredItem.name}
                    className="h-14 w-14 rounded-lg border border-slate-700/70 bg-slate-900/80 object-contain"
                    onError={(event) => {
                      (event.currentTarget as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <div className="space-y-1">
                    <h4 className={`text-lg font-semibold ${getRarityTextClasses(hoveredItem.rarity)}`}>{hoveredItem.name}</h4>
                    {hoveredItem.itemType && <p className="text-sm text-slate-300">{hoveredItem.itemType}</p>}
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getBadgeClassName({ label: `Tier ${hoveredItem.tier ?? '?'}`, tone: 'outline' })}>
                        Tier {hoveredItem.tier ?? '?'}
                      </Badge>
                      {hoveredItem.gearScoreMax && (
                        <Badge className="border-none bg-slate-800/80 text-slate-200">GS {hoveredItem.gearScoreMax}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {hoveredItem.description && <p className="text-sm text-slate-200">{hoveredItem.description}</p>}

                {hoveredItem.attributes?.length ? (
                  <div className="space-y-1 text-sm text-blue-300">
                    {hoveredItem.attributes.slice(0, 3).map((attribute, attributeIndex) => (
                      <div key={`${cardKey}-attribute-${attributeIndex}`} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-400" />
                        <span>
                          +{attribute.value} {attribute.name}
                          {attribute.isSelectable ? ' (selectable)' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}

                {hoveredItem.perks?.length ? (
                  <div className="space-y-1 text-sm text-yellow-300">
                    {hoveredItem.perks.slice(0, 3).map((perk, perkIndex) => (
                      <div key={`${cardKey}-perk-${perkIndex}`} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-yellow-400" />
                        <span>{perk.name ?? 'Random Perk'}</span>
                      </div>
                    ))}
                    {hoveredItem.perks.length > 3 && (
                      <p className="text-xs text-slate-400">+{hoveredItem.perks.length - 3} more perks</p>
                    )}
                  </div>
                ) : null}

                {hoveredItem.randomPerkBuckets?.length ? (
                  <div className="space-y-1 text-xs text-amber-200">
                    {hoveredItem.randomPerkBuckets.slice(0, 1).map((bucket, bucketIndex) => (
                      <div key={`${cardKey}-bucket-${bucketIndex}`} className="space-y-1">
                        <p className="text-sm font-semibold text-yellow-300">
                          Random ({formatChance(bucket.chance)})
                        </p>
                        <div className="space-y-1 text-[11px] text-amber-100">
                          {bucket.options.slice(0, 3).map((option, optionIndex) => (
                            <div
                              key={`${cardKey}-bucket-${bucketIndex}-option-${optionIndex}`}
                              className="flex items-center gap-2"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                              <span>{formatChance(option.chance)} {option.name ?? option.id}</span>
                            </div>
                          ))}
                          {bucket.options.length > 3 && (
                            <p className="text-[10px] text-slate-400">
                              +{bucket.options.length - 3} more possibilities
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : config.hoverType === 'perk' && isHoveringPerk && hoveredPerk ? (
              <div className="space-y-3 p-4">
                <div className="flex items-start gap-3">
                  <img
                    src={resolveIconUrl(hoveredPerk.icon)}
                    alt={hoveredPerk.name}
                    className="h-14 w-14 rounded-lg border border-slate-700/70 bg-slate-900/80 object-contain"
                    onError={(event) => {
                      (event.currentTarget as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <div className="space-y-1">
                    <h4 className={`text-lg font-semibold ${getRarityTextClasses(hoveredPerk.rarity)}`}>{hoveredPerk.name}</h4>
                    {hoveredPerk.itemType && <p className="text-sm text-slate-300">{hoveredPerk.itemType}</p>}
                    <Badge className={getBadgeClassName({ label: `Tier ${hoveredPerk.tier ?? '?'}`, tone: 'outline' })}>
                      Tier {hoveredPerk.tier ?? '?'}
                    </Badge>
                  </div>
                </div>
                {hoveredPerk.description && <p className="text-sm text-slate-200">{hoveredPerk.description}</p>}
              </div>
            ) : (
              <div className="p-4 text-sm text-slate-300">Hover to load detailed stats.</div>
            )}
          </HoverCardContent>
        </HoverCard>
      );
    },
    [activeHoverKey, handleEntityHover, handleMouseLeave, hoverLoading, hoveredItem, hoveredPerk, selectEntity],
  );

"
text = text[:start] + new_block + text[end:]
path.write_text(text, encoding="utf-8")
