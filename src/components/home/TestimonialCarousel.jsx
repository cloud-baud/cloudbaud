import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { testimonials } from '../../data/testimonials';
import { Button } from '@/shared/ui/button';

const TestimonialCarousel = () => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
    const [selectedIndex, setSelectedIndex] = useState(0);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        return () => emblaApi.off('select', onSelect);
    }, [emblaApi, onSelect]);

    return (
        <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%] px-4"
                        >
                            <div className="bg-white border border-gray-100 rounded-2xl p-8 h-full shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300">
                                {/* Quote Icon */}
                                <Quote className="h-10 w-10 text-blue-600 mb-4 opacity-10" />

                                {/* Rating */}
                                <div className="flex mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                                    ))}
                                </div>

                                {/* Quote */}
                                <p className="text-gray-700 text-lg mb-8 leading-relaxed font-serif italic">
                                    "{testimonial.quote}"
                                </p>

                                {/* Author */}
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4 shadow-lg shadow-blue-100">
                                        <span className="text-white font-bold">
                                            {testimonial.name.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{testimonial.name}</div>
                                        <div className="text-sm text-gray-500 font-medium">
                                            {testimonial.role}, {testimonial.company}
                                        </div>
                                    </div>
                                </div>

                                {/* Project Type Badge */}
                                <div className="mt-6 pt-6 border-t border-gray-50">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 uppercase tracking-wider">
                                        {testimonial.projectType}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-center gap-6 mt-12">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={scrollPrev}
                    className="w-12 h-12 border-gray-200 text-gray-600 hover:bg-white hover:text-blue-600 hover:border-blue-600 transition-all rounded-full"
                >
                    <ChevronLeft className="h-6 w-6" />
                </Button>

                {/* Dots */}
                <div className="flex gap-3">
                    {testimonials.map((_, index) => (
                        <button
                            key={index}
                            className={`h-2 rounded-full transition-all duration-300 ${index === selectedIndex
                                ? 'w-10 bg-blue-600'
                                : 'w-2 bg-gray-200 hover:bg-gray-300'
                                }`}
                            onClick={() => emblaApi?.scrollTo(index)}
                        />
                    ))}
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={scrollNext}
                    className="w-12 h-12 border-gray-200 text-gray-600 hover:bg-white hover:text-blue-600 hover:border-blue-600 transition-all rounded-full"
                >
                    <ChevronRight className="h-6 w-6" />
                </Button>
            </div>
        </div>
    );
};

export default TestimonialCarousel;
